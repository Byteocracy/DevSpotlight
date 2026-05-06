import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { useAuth } from "./hooks/useAuth";
import {
  createProject,
  getProjectById,
  getProjects,
  toggleProjectLike,
} from "./api/project.api";
import { addComment, getProjectComments } from "./api/comment.api";
import {
  approveContributionRequest,
  getContributionRequests,
  rejectContributionRequest,
  sendContributionRequest,
} from "./api/contribution.api";

const emptyProjectForm = {
  title: "",
  description: "",
  techStack: "",
  githubLink: "",
  liveLink: "",
  images: "",
};

const emptyAuthForm = {
  userName: "",
  fullName: "",
  email: "",
  password: "",
  bio: "",
};

function App() {
  const { user, isAuthenticated, login, register, logout, loading } = useAuth();
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [commentText, setCommentText] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [query, setQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const isOwner = useMemo(() => {
    if (!user || !selectedProject?.userId) {
      return false;
    }

    return selectedProject.userId._id === user._id;
  }, [selectedProject, user]);

  const handleError = (error, fallbackMessage) => {
    setStatusMessage(error?.response?.data?.message || fallbackMessage);
  };

  const loadProjects = useCallback(async (page, searchQuery) => {
    try {
      const response = await getProjects({ page, limit: 6, query: searchQuery });
      setProjects(response.projects);
      setPagination((current) => ({ ...current, ...response.pagination, page }));
    } catch (error) {
      handleError(error, "Unable to load projects");
    }
  }, []);

  const loadRequestsIfOwner = useCallback(
    async (project) => {
      if (!project?.userId || !user || project.userId._id !== user._id) {
        setRequests([]);
        return;
      }

      try {
        const response = await getContributionRequests(project._id);
        setRequests(response);
      } catch (error) {
        handleError(error, "Unable to load contribution requests");
      }
    },
    [user]
  );

  const handleSelectProject = useCallback(
    async (projectId) => {
      try {
        const [project, projectComments] = await Promise.all([
          getProjectById(projectId),
          getProjectComments(projectId),
        ]);

        setSelectedProject(project);
        setComments(projectComments);
        await loadRequestsIfOwner(project);
      } catch (error) {
        handleError(error, "Unable to load project details");
      }
    },
    [loadRequestsIfOwner]
  );

  useEffect(() => {
    void (async () => {
      try {
        const response = await getProjects({
          page: pagination.page,
          limit: 6,
          query,
        });
        setProjects(response.projects);
        setPagination((current) => ({
          ...current,
          ...response.pagination,
          page: pagination.page,
        }));
      } catch (error) {
        handleError(error, "Unable to load projects");
      }
    })();
  }, [pagination.page, query]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      void (async () => {
        try {
          const [project, projectComments] = await Promise.all([
            getProjectById(projects[0]._id),
            getProjectComments(projects[0]._id),
          ]);

          setSelectedProject(project);
          setComments(projectComments);
          await loadRequestsIfOwner(project);
        } catch (error) {
          handleError(error, "Unable to load project details");
        }
      })();
    }
  }, [projects, selectedProject, loadRequestsIfOwner]);

  function handleError(error, fallbackMessage) {
    setStatusMessage(error?.response?.data?.message || fallbackMessage);
  }

  async function loadProjects(page, searchQuery) {
    try {
      const response = await getProjects({ page, limit: 6, query: searchQuery });
      setProjects(response.projects);
      setPagination((current) => ({ ...current, ...response.pagination, page }));
    } catch (error) {
      handleError(error, "Unable to load projects");
    }
  }

  const loadRequestsIfOwner = useCallback(async (project) => {
    if (!project?.userId || !user || project.userId._id !== user._id) {
      setRequests([]);
      return;
    }

    try {
      const response = await getContributionRequests(project._id);
      setRequests(response);
    } catch (error) {
      handleError(error, "Unable to load contribution requests");
    }
  }, [user]);

  async function handleSelectProject(projectId) {
    try {
      const [project, projectComments] = await Promise.all([
        getProjectById(projectId),
        getProjectComments(projectId),
      ]);

      setSelectedProject(project);
      setComments(projectComments);
      await loadRequestsIfOwner(project);
    } catch (error) {
      handleError(error, "Unable to load project details");
    }
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setIsBusy(true);

    try {
      if (authMode === "login") {
        await login({
          userName: authForm.userName,
          password: authForm.password,
        });
        setStatusMessage("Signed in successfully");
      } else {
        await register(authForm);
        setStatusMessage("Account created successfully");
      }

      setAuthForm(emptyAuthForm);
    } catch (error) {
      handleError(error, "Authentication failed");
    } finally {
      setIsBusy(false);
    }
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();
    setIsBusy(true);

    try {
      const created = await createProject(projectForm);
      setProjectForm(emptyProjectForm);
      setStatusMessage("Project published successfully");
      setPagination((current) => ({ ...current, page: 1 }));
      await loadProjects(1, query);
      await handleSelectProject(created._id);
    } catch (error) {
      handleError(error, "Unable to create project");
    } finally {
      setIsBusy(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !selectedProject) {
      setStatusMessage("Sign in to like projects");
      return;
    }

    try {
      const response = await toggleProjectLike(selectedProject._id);
      setSelectedProject((current) =>
        current ? { ...current, likeCount: response.likeCount } : current
      );
      setProjects((current) =>
        current.map((project) =>
          project._id === selectedProject._id
            ? { ...project, likeCount: response.likeCount }
            : project
        )
      );
      setStatusMessage(response.liked ? "Project liked" : "Project unliked");
    } catch (error) {
      handleError(error, "Unable to update like");
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated || !selectedProject) {
      setStatusMessage("Sign in to comment");
      return;
    }

    try {
      const comment = await addComment(selectedProject._id, { content: commentText });
      setComments((current) => [comment, ...current]);
      setCommentText("");
      setSelectedProject((current) =>
        current ? { ...current, commentCount: current.commentCount + 1 } : current
      );
      setProjects((current) =>
        current.map((project) =>
          project._id === selectedProject._id
            ? { ...project, commentCount: project.commentCount + 1 }
            : project
        )
      );
      setStatusMessage("Comment added");
    } catch (error) {
      handleError(error, "Unable to add comment");
    }
  };

  const handleContributionRequest = async () => {
    if (!isAuthenticated || !selectedProject) {
      setStatusMessage("Sign in to request contribution");
      return;
    }

    try {
      await sendContributionRequest(selectedProject._id);
      setStatusMessage("Contribution request sent");
    } catch (error) {
      handleError(error, "Unable to send contribution request");
    }
  };

  const handleContributionAction = async (requestId, action) => {
    try {
      if (action === "approve") {
        await approveContributionRequest(requestId);
      } else {
        await rejectContributionRequest(requestId);
      }

      if (selectedProject) {
        await loadRequestsIfOwner(selectedProject);
      }

      setStatusMessage(`Request ${action}d`);
    } catch (error) {
      handleError(error, "Unable to update contribution request");
    }
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Student project showcase platform</p>
          <h1>DevSpotlight</h1>
          <p className="lede">
            Publish work, explore recent builds, and open contribution channels in one place.
          </p>
        </div>
        <div className="topbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-chip">
                <span>{user.fullName}</span>
                <small>@{user.userName}</small>
              </div>
              <button className="ghost-button" type="button" onClick={() => void logout()}>
                Logout
              </button>
            </>
          ) : (
            <span className="status-dot">Guest mode</span>
          )}
        </div>
      </header>

      <main className="layout">
        <section className="panel panel-hero">
          <div className="hero-card">
            <div className="hero-copy">
              <span className="tag">Latest student work</span>
              <h2>Projects sorted by newest with built-in collaboration hooks.</h2>
              <p>
                The backend now exposes paginated project APIs, comment threads, like toggles, and contribution request flows.
              </p>
            </div>
            <div className="hero-stats">
              <article>
                <strong>{projects.length}</strong>
                <span>Visible projects</span>
              </article>
              <article>
                <strong>{selectedProject?.likeCount ?? 0}</strong>
                <span>Likes on selected</span>
              </article>
              <article>
                <strong>{selectedProject?.commentCount ?? 0}</strong>
                <span>Comments on selected</span>
              </article>
            </div>
          </div>
        </section>

        <section className="panel">
          {!isAuthenticated ? (
            <form className="auth-card" onSubmit={handleAuthSubmit}>
              <div className="section-head">
                <h3>{authMode === "login" ? "Sign in" : "Create account"}</h3>
                <div className="segmented">
                  <button className={authMode === "login" ? "active" : ""} type="button" onClick={() => setAuthMode("login")}>Login</button>
                  <button className={authMode === "register" ? "active" : ""} type="button" onClick={() => setAuthMode("register")}>Register</button>
                </div>
              </div>
              <div className="form-grid">
                <input placeholder="Username" value={authForm.userName} onChange={(event) => setAuthForm((current) => ({ ...current, userName: event.target.value }))} />
                {authMode === "register" && <input placeholder="Full name" value={authForm.fullName} onChange={(event) => setAuthForm((current) => ({ ...current, fullName: event.target.value }))} />}
                {authMode === "register" && <input placeholder="Email" value={authForm.email} onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))} />}
                <input placeholder="Password" type="password" value={authForm.password} onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))} />
                {authMode === "register" && <textarea placeholder="Short bio" rows="3" value={authForm.bio} onChange={(event) => setAuthForm((current) => ({ ...current, bio: event.target.value }))} />}
                  <button
                    className={authMode === "login" ? "active" : ""}
                    type="button"
                    onClick={() => setAuthMode("login")}
                  >
                    Login
                  </button>
                  <button
                    className={authMode === "register" ? "active" : ""}
                    type="button"
                    onClick={() => setAuthMode("register")}
                  >
                    Register
                  </button>
                </div>
              </div>
              <div className="form-grid">
                <input
                  placeholder="Username"
                  value={authForm.userName}
                  onChange={(event) =>
                    setAuthForm((current) => ({ ...current, userName: event.target.value }))
                  }
                />
                {authMode === "register" && (
                  <input
                    placeholder="Full name"
                    value={authForm.fullName}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, fullName: event.target.value }))
                    }
                  />
                )}
                {authMode === "register" && (
                  <input
                    placeholder="Email"
                    value={authForm.email}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                )}
                <input
                  placeholder="Password"
                  type="password"
                  value={authForm.password}
                  onChange={(event) =>
                    setAuthForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
                {authMode === "register" && (
                  <textarea
                    placeholder="Short bio"
                    rows="3"
                    value={authForm.bio}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, bio: event.target.value }))
                    }
                  />
                )}
              </div>
              <button className="primary-button" type="submit" disabled={isBusy || loading}>
                {authMode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>
          ) : (
            <form className="composer-card" onSubmit={handleProjectSubmit}>
              <div className="section-head">
                <h3>Publish a project</h3>
                <p>Use comma-separated values for tech stack and image URLs.</p>
              </div>
              <div className="form-grid form-grid-wide">
                <input placeholder="Project title" value={projectForm.title} onChange={(event) => setProjectForm((current) => ({ ...current, title: event.target.value }))} />
                <input placeholder="Tech stack" value={projectForm.techStack} onChange={(event) => setProjectForm((current) => ({ ...current, techStack: event.target.value }))} />
                <textarea placeholder="Project description" rows="4" value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} />
                <input placeholder="GitHub link" value={projectForm.githubLink} onChange={(event) => setProjectForm((current) => ({ ...current, githubLink: event.target.value }))} />
                <input placeholder="Live link" value={projectForm.liveLink} onChange={(event) => setProjectForm((current) => ({ ...current, liveLink: event.target.value }))} />
                <input placeholder="Image URLs" value={projectForm.images} onChange={(event) => setProjectForm((current) => ({ ...current, images: event.target.value }))} />
              </div>
              <button className="primary-button" type="submit" disabled={isBusy}>Publish project</button>
                <input
                  placeholder="Project title"
                  value={projectForm.title}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
                <input
                  placeholder="Tech stack"
                  value={projectForm.techStack}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, techStack: event.target.value }))
                  }
                />
                <textarea
                  placeholder="Project description"
                  rows="4"
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
                <input
                  placeholder="GitHub link"
                  value={projectForm.githubLink}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, githubLink: event.target.value }))
                  }
                />
                <input
                  placeholder="Live link"
                  value={projectForm.liveLink}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, liveLink: event.target.value }))
                  }
                />
                <input
                  placeholder="Image URLs"
                  value={projectForm.images}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, images: event.target.value }))
                  }
                />
              </div>
              <button className="primary-button" type="submit" disabled={isBusy}>
                Publish project
              </button>
            </form>
          )}
        </section>

        <section className="panel panel-feed">
          <div className="section-head">
            <div>
              <h3>Project feed</h3>
              <p>Newest first, paginated, searchable.</p>
            </div>
            <input className="search-input" placeholder="Search title, description, or stack" value={query} onChange={(event) => { setQuery(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} />
            <input
              className="search-input"
              placeholder="Search title, description, or stack"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPagination((current) => ({ ...current, page: 1 }));
              }}
            />
          </div>

          <div className="feed-grid">
            <div className="project-list">
              {projects.map((project) => (
                <button key={project._id} type="button" className={`project-card ${selectedProject?._id === project._id ? "selected" : ""}`} onClick={() => void handleSelectProject(project._id)}>
                <button
                  key={project._id}
                  type="button"
                  className={`project-card ${selectedProject?._id === project._id ? "selected" : ""}`}
                  onClick={() => void handleSelectProject(project._id)}
                >
                  <div className="project-card-top">
                    <span>{project.techStack?.[0] || "Project"}</span>
                    <small>{new Date(project.createdAt).toLocaleDateString()}</small>
                  </div>
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                  <div className="project-meta">
                    <span>by @{project.userId?.userName}</span>
                    <span>{project.likeCount} likes</span>
                    <span>{project.commentCount} comments</span>
                  </div>
                </button>
              ))}
            </div>

            <aside className="detail-card">
              {selectedProject ? (
                <>
                  <div className="detail-header">
                    <div>
                      <span className="tag">{selectedProject.techStack?.join(" · ") || "Student project"}</span>
                      <h3>{selectedProject.title}</h3>
                    </div>
                    <div className="detail-actions">
                      <button className="ghost-button" type="button" onClick={() => void handleLike()}>Like {selectedProject.likeCount}</button>
                      {!isOwner && <button className="primary-button" type="button" onClick={() => void handleContributionRequest()}>Request contribution</button>}
                      <span className="tag">
                        {selectedProject.techStack?.join(" · ") || "Student project"}
                      </span>
                      <h3>{selectedProject.title}</h3>
                    </div>
                    <div className="detail-actions">
                      <button className="ghost-button" type="button" onClick={() => void handleLike()}>
                        Like {selectedProject.likeCount}
                      </button>
                      {!isOwner && (
                        <button
                          className="primary-button"
                          type="button"
                          onClick={() => void handleContributionRequest()}
                        >
                          Request contribution
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="detail-description">{selectedProject.description}</p>

                  <div className="link-row">
                    {selectedProject.githubLink && <a href={selectedProject.githubLink} target="_blank" rel="noreferrer">GitHub</a>}
                    {selectedProject.liveLink && <a href={selectedProject.liveLink} target="_blank" rel="noreferrer">Live demo</a>}
                  </div>

                  <div className="image-strip">
                    {selectedProject.images?.length ? selectedProject.images.map((image) => <a key={image} href={image} target="_blank" rel="noreferrer">{image}</a>) : <span>No images added yet.</span>}
                    {selectedProject.githubLink && (
                      <a href={selectedProject.githubLink} target="_blank" rel="noreferrer">
                        GitHub
                      </a>
                    )}
                    {selectedProject.liveLink && (
                      <a href={selectedProject.liveLink} target="_blank" rel="noreferrer">
                        Live demo
                      </a>
                    )}
                  </div>

                  <div className="image-strip">
                    {selectedProject.images?.length ? (
                      selectedProject.images.map((image) => (
                        <a key={image} href={image} target="_blank" rel="noreferrer">
                          {image}
                        </a>
                      ))
                    ) : (
                      <span>No images added yet.</span>
                    )}
                  </div>

                  <section className="comments-block">
                    <div className="section-head">
                      <h4>Comments</h4>
                      <span>{comments.length}</span>
                    </div>

                    <form className="inline-form" onSubmit={handleCommentSubmit}>
                      <input
                        placeholder="Add a comment"
                        value={commentText}
                        onChange={(event) => setCommentText(event.target.value)}
                      />
                      <button className="primary-button" type="submit">
                        Post
                      </button>
                    </form>

                    <div className="comment-list">
                      {comments.map((comment) => (
                        <article key={comment._id} className="comment-card">
                          <div className="comment-head">
                            <strong>{comment.owner?.fullName || comment.owner?.userName}</strong>
                            <span>@{comment.owner?.userName}</span>
                          </div>
                          <p>{comment.content}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  {isOwner && (
                    <section className="comments-block">
                      <div className="section-head">
                        <h4>Contribution requests</h4>
                        <span>{requests.length}</span>
                      </div>
                      <div className="comment-list">
                        {requests.map((request) => (
                          <article key={request._id} className="comment-card">
                            <div className="comment-head">
                              <strong>{request.userId?.fullName}</strong>
                              <span>{request.status}</span>
                            </div>
                            <p>@{request.userId?.userName}</p>
                            {request.status === "pending" && (
                              <div className="request-actions">
                                <button className="primary-button" type="button" onClick={() => void handleContributionAction(request._id, "approve")}>Approve</button>
                                <button className="ghost-button" type="button" onClick={() => void handleContributionAction(request._id, "reject")}>Reject</button>
                                <button
                                  className="primary-button"
                                  type="button"
                                  onClick={() =>
                                    void handleContributionAction(request._id, "approve")
                                  }
                                >
                                  Approve
                                </button>
                                <button
                                  className="ghost-button"
                                  type="button"
                                  onClick={() =>
                                    void handleContributionAction(request._id, "reject")
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <div className="empty-state">Select a project to inspect its details.</div>
              )}
            </aside>
          </div>

          <div className="pagination-row">
            <button className="ghost-button" type="button" disabled={!pagination.hasPreviousPage} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button className="ghost-button" type="button" disabled={!pagination.hasNextPage} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button>
            <button
              className="ghost-button"
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() =>
                setPagination((current) => ({ ...current, page: current.page - 1 }))
              }
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="ghost-button"
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setPagination((current) => ({ ...current, page: current.page + 1 }))
              }
            >
              Next
            </button>
          </div>
        </section>
      </main>

      <footer className="footer-bar">
        <span>{statusMessage || "Ready"}</span>
      </footer>
    </div>
  );
}

export default App;
