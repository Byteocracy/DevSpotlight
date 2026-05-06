import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  userName: user.userName,
  fullName: user.fullName,
  email: user.email,
  bio: user.bio,
  avatar: user.avatar,
  coverImage: user.coverImage,
  role: user.role,
});

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found during token generation");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const sanitizeUser = (user) => ({
  _id: user._id,
  userName: user.userName,
  fullName: user.fullName,
  email: user.email,
  bio: user.bio,
  avatar: user.avatar,
  coverImage: user.coverImage,
  role: user.role,
});

//register
const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password, bio, avatar, coverImage } =
    req.body;

  if (
    [userName, fullName, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "Username, full name, email, and password are required");
  }

  const existingUser = await User.findOne({
    $or: [{ userName: userName.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (existingUser) {
    throw new ApiError(400, "User already registered");
  }

  const registeredUser = await User.create({
    userName: userName.toLowerCase(),
    fullName: fullName.trim(),
    email: email.toLowerCase(),
  if (user) {
    throw new ApiError(400, "User already registered!");
  }

  //create user
  const registeredUser = await User.create({
    userName,
    fullName,
    email,
    password,
    bio: bio?.trim() || undefined,
    avatar: avatar?.trim() || undefined,
    coverImage: coverImage?.trim() || "",
  });

  const createdUser = await User.findById(registeredUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(400, "User registration failed!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    createdUser._id
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: sanitizeUser(createdUser),
        accessToken,
        refreshToken,
      },
      "User registered successfully"
    )
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: sanitizeUser(createdUser), accessToken, refreshToken },
        "User registered successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if ((!userName && !email) || !password?.trim()) {
    throw new ApiError(400, "Username or email and password are required");
  }

  const user = await User.findOne(
    email
      ? { email: email.toLowerCase() }
      : { userName: userName.toLowerCase() }
    email ? { email: email.toLowerCase() } : { userName: userName.toLowerCase() }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: sanitizeUser(user),
          accessToken,
          refreshToken,
        },
        "Logged in successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
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

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
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
      .json(
        new ApiResponse(200, { accessToken, refreshToken }, "Token refreshed")
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  getCurrentUser,
};
