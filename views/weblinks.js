<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web-Links | Library of Thoughts</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<%= BASE_PATH %>/css/styles.css">
    <link rel="stylesheet" href="<%= BASE_PATH %>/css/home.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="content-wrapper">
        <!-- Navbar Section -->
        <%- include('navbar', { activePage: 'weblinks', user: user }); %>

        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/liturgicalCalendar">Liturgical Calendar</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/insights">Insights</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/anecdotes">Anecdotes</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/books">Books</a>
            </li>
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="<%= BASE_PATH %>/weblinks">Web-Links</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/grammar">Grammar</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/archives">Archives</a>
            </li>
        </ul>

        <!-- Main Content Area -->
        <main class="container main-content mt-4">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <!-- Add New Web-Link Form -->
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-plus me-2"></i>Add New Web-Link
                        </div>
                        <div class="card-body">
                            <form action="<%= BASE_PATH %>/weblinks/create" method="POST">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Link Title</label>
                                    <input type="text" class="form-control" id="title" name="title" placeholder="e.g., Vatican Official Website" required>
                                </div>
                                <div class="mb-3">
                                    <label for="url" class="form-label">URL</label>
                                    <input type="url" class="form-control" id="url" name="url" placeholder="e.g., https://www.vatican.va" required>
                                </div>
                                <div class="mb-3">
                                    <label for="notes" class="form-label">Notes (Optional)</label>
                                    <textarea class="form-control" id="notes" name="notes" rows="3" placeholder="Brief description or why this link is useful..."></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="hashtags" class="form-label">Hashtags</label>
                                    <input type="text" class="form-control" id="hashtags" name="hashtags" placeholder="#catholic #resources #news (separate with spaces or commas)">
                                    <div class="form-text">Categorize your links for easy searching.</div>
                                </div>
                                <div class="d-flex justify-content-end">
                                    <button type="reset" class="btn btn-outline-secondary me-2">Clear</button>
                                    <button type="submit" class="btn btn-primary">Save Link</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Previous Web-Links Section -->
                    <div class="mt-5">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3><i class="fas fa-link me-2 text-primary-color"></i>Your Web-Links</h3>
                            <form class="d-flex" action="<%= BASE_PATH %>/weblinks" method="GET">
                                <input type="text" class="form-control form-control-sm me-2" name="search" placeholder="Search links..." value="<%= typeof search !== 'undefined' ? search : '' %>">
                                <button type="submit" class="btn btn-sm btn-primary">Search</button>
                            </form>
                        </div>

                        <% if (weblinks && weblinks.length > 0) { %>
                            <div class="row row-cols-1 g-3">
                                <% weblinks.forEach(weblink => { %>
                                    <div class="col">
                                        <div class="card shadow-sm">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between align-items-center mb-2">
                                                    <h5 class="card-title mb-0"><a href="<%= weblink.url %>" target="_blank" class="text-decoration-none text-primary"><%= weblink.title %> <i class="fas fa-external-link-alt fa-xs ms-1"></i></a></h5>
                                                    <small class="text-muted"><%= weblink.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) %></small>
                                                </div>
                                                <p class="card-text mb-2"><%= weblink.notes.substring(0, 150) %><% if (weblink.notes.length > 150) { %>...<% } %></p>
                                                <div class="hashtags mb-3">
                                                    <% weblink.hashtags.forEach(tag => { %>
                                                        <span class="badge bg-light text-dark me-1">#<%= tag.name %></span>
                                                    <% }); %>
                                                </div>
                                                <div class="d-flex justify-content-end">
                                                    <a href="<%= BASE_PATH %>/weblinks/edit/<%= weblink.id %>" class="btn btn-sm btn-outline-primary me-2">
                                                        <i class="fas fa-edit me-1"></i>Edit
                                                    </a>
                                                    <button type="button" class="btn btn-sm btn-outline-danger delete-weblink-btn" data-id="<%= weblink.id %>">
                                                        <i class="fas fa-trash-alt me-1"></i>Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                <% }); %>
                            </div>
                        <% } else { %>
                            <div class="reflection-placeholder">
                                <i class="fas fa-link"></i>
                                <h4>No web-links found</h4>
                                <p class="mb-0">Start saving your useful spiritual web-links here!</p>
                            </div>
                        <% } %>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Delete Confirmation Modal for Web-Links -->
    <div class="modal fade" id="deleteWeblinkModal" tabindex="-1" aria-labelledby="deleteWeblinkModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="deleteWeblinkModalLabel">Confirm Deletion</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete this web-link entry? This action cannot be undone.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <form id="deleteWeblinkForm" method="POST" action="">
                        <button type="submit" class="btn btn-danger">Delete</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer Section -->
    <%- include('footer'); %>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Delete Confirmation Modal for Web-Links
            const deleteButtons = document.querySelectorAll('.delete-weblink-btn');
            const deleteWeblinkForm = document.getElementById('deleteWeblinkForm');
            const deleteWeblinkModal = new bootstrap.Modal(document.getElementById('deleteWeblinkModal'));

            deleteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const weblinkId = this.dataset.id;
                    deleteWeblinkForm.action = `<%= BASE_PATH %>/weblinks/delete/${weblinkId}`;
                    deleteWeblinkModal.show();
                });
            });
        });
    </script>
</body>
</html>
