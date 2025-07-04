<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anecdotes | Library of Thoughts</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="/css/home.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="content-wrapper">
        <!-- Navbar Section -->
        <%- include('navbar', { activePage: 'anecdotes', user: user }); %>

        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
                <a class="nav-link" href="/liturgicalCalendar">Liturgical Calendar</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/insights">Insights</a>
            </li>
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="/anecdotes">Anecdotes</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/books">Books</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/weblinks">Web-Links</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/grammar">Grammar</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/archives">Archives</a>
            </li>
        </ul>

        <!-- Main Content Area -->
        <main class="container main-content mt-4">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <!-- Add New Anecdote Form -->
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-plus me-2"></i>Add New Anecdote
                        </div>
                        <div class="card-body">
                            <form action="/anecdotes/create" method="POST">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Anecdote Title</label>
                                    <input type="text" class="form-control" id="title" name="title" placeholder="A short, descriptive title" required>
                                </div>
                                <div class="mb-3">
                                    <label for="content" class="form-label">Anecdote Content</label>
                                    <textarea class="form-control" id="content" name="content" rows="6" placeholder="Write the story or narrative here..." required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="hashtags" class="form-label">Hashtags</label>
                                    <input type="text" class="form-control" id="hashtags" name="hashtags" placeholder="#biblical #personal #inspiring (separate with spaces or commas)">
                                    <div class="form-text">Categorize your anecdotes for easy searching.</div>
                                </div>
                                <div class="d-flex justify-content-end">
                                    <button type="reset" class="btn btn-outline-secondary me-2">Clear</button>
                                    <button type="submit" class="btn btn-primary">Save Anecdote</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Previous Anecdotes Section -->
                    <div class="mt-5">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3><i class="fas fa-history me-2 text-primary-color"></i>Previous Anecdotes</h3>
                            <form class="d-flex" action="/anecdotes" method="GET">
                                <input type="text" class="form-control form-control-sm me-2" name="search" placeholder="Search anecdotes..." value="<%= typeof search !== 'undefined' ? search : '' %>">
                                <button type="submit" class="btn btn-sm btn-primary">Search</button>
                            </form>
                        </div>

                        <% if (anecdotes && anecdotes.length > 0) { %>
                            <div class="row row-cols-1 g-3">
                                <% anecdotes.forEach(anecdote => { %>
                                    <div class="col">
                                        <div class="card shadow-sm">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between align-items-center mb-2">
                                                    <h5 class="card-title mb-0"><%= anecdote.title %></h5>
                                                    <small class="text-muted"><%= anecdote.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) %></small>
                                                </div>
                                                <p class="card-text mb-2"><%= anecdote.content.substring(0, 150) %><% if (anecdote.content.length > 150) { %>...<% } %></p>
                                                <div class="hashtags mb-3">
                                                    <% anecdote.hashtags.forEach(tag => { %>
                                                        <span class="badge bg-light text-dark me-1">#<%= tag.name %></span>
                                                    <% }); %>
                                                </div>
                                                <div class="d-flex justify-content-end">
                                                    <a href="/anecdotes/edit/<%= anecdote.id %>" class="btn btn-sm btn-outline-primary me-2">
                                                        <i class="fas fa-edit me-1"></i>Edit
                                                    </a>
                                                    <button type="button" class="btn btn-sm btn-outline-danger delete-anecdote-btn" data-id="<%= anecdote.id %>">
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
                                <i class="fas fa-book-open"></i>
                                <h4>No anecdotes found</h4>
                                <p class="mb-0">Start adding your inspiring stories here!</p>
                            </div>
                        <% } %>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Delete Confirmation Modal for Anecdotes -->
    <div class="modal fade" id="deleteAnecdoteModal" tabindex="-1" aria-labelledby="deleteAnecdoteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="deleteAnecdoteModalLabel">Confirm Deletion</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete this anecdote? This action cannot be undone.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <form id="deleteAnecdoteForm" method="POST" action="">
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
            // Delete Confirmation Modal for Anecdotes
            const deleteButtons = document.querySelectorAll('.delete-anecdote-btn');
            const deleteAnecdoteForm = document.getElementById('deleteAnecdoteForm');
            const deleteAnecdoteModal = new bootstrap.Modal(document.getElementById('deleteAnecdoteModal'));

            deleteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const anecdoteId = this.dataset.id;
                    deleteAnecdoteForm.action = `/anecdotes/delete/${anecdoteId}`;
                    deleteAnecdoteModal.show();
                });
            });
        });
    </script>
</body>
</html>
