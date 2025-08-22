import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// generate generateAccess And RefreshToken
const generateAccessAndRefreshToken = async (userId) => {
  try {
    console.log("Trying to generate tokens for userId:", userId);

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found during token generation");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};
//register
const registerUser = asyncHandler(async (req, res) => {
  //get user name, email ,passWord, full name, avatar, cover-image

  const { userName, fullName, email, password } = req.body;
  const { avatarImage, coverImage } = req.files;

  if (
    [userName, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "User details are mandatory!");
  }

  //check if user already exists

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (user) {
    throw new ApiError(400, "User already registered!");
  }

  //check if avatar image present
  if (!avatarImage) {
    throw new ApiError(404, "Avatar image not found!");
  }

  const avatarFile = avatarImage?.[0];
  const coverFile = coverImage?.[0];

  if (!avatarFile) {
    throw new ApiError(404, "Avatar image not found!");
  }

  // Upload to Cloudinary
  const avatarUpload = await uploadOnCloudinary(avatarFile.path);
  const coverUpload = coverFile
    ? await uploadOnCloudinary(coverFile.path)
    : null;

  //create user
  const registerUser = await User.create({
    userName,
    fullName,
    email,
    password,
    avatar: avatarUpload?.url,
    coverImage: coverUpload?.url || "",
  });

  const createdUser = await User.findById(registerUser._id).selelect(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(400, "User registration failed!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully !!"));
});

//login
const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if ([userName, email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "user Credentials are required !");
  }

  //check user
  const user = await User.findOne({ userName, password }).selelect(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  //check password
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiResponse(400, "invalid credentials!");
  }

  //generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //cookies config
  const options = {
    https: true,
    secure: true,
  };
  //send response
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(200, user, "logged in successfully!");
});

//logout
const logOutUser = asyncHandler(async (req, res) => {
  //1->find user

  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );

  //2-> remove the accessToken

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

//refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(404, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken }));
  } catch (error) {
    throw new ApiError(401, error?.message || " Invalid");
  }
});

export { registerUser, loginUser, logOutUser, refreshAccessToken };
