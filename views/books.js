<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Books | Library of Thoughts</title>
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
        <%- include('navbar', { activePage: 'books', user: user }); %>

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
                <a class="nav-link active" aria-current="page" href="<%= BASE_PATH %>/books">Books</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/weblinks">Web-Links</a>
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
                    <!-- Add New Book Form -->
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-plus me-2"></i>Add New Book
                        </div>
                        <div class="card-body">
                            <form action="<%= BASE_PATH %>/books/create" method="POST">
                                <div class="mb-3">
                                    <label for="title" class="form-label">Book Title</label>
                                    <input type="text" class="form-control" id="title" name="title" placeholder="e.g., The Screwtape Letters" required>
                                </div>
                                <div class="mb-3">
                                    <label for="author" class="form-label">Author</label>
                                    <input type="text" class="form-control" id="author" name="author" placeholder="e.g., C.S. Lewis" required>
                                </div>
                                <div class="mb-3">
                                    <label for="notes" class="form-label">Notes/Summary</label>
                                    <textarea class="form-control" id="notes" name="notes" rows="4" placeholder="Your thoughts, key takeaways, or summary..."></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="link" class="form-label">External Link (Optional)</label>
                                    <input type="url" class="form-control" id="link" name="link" placeholder="e.g., https://www.amazon.com/book-title">
                                </div>
                                <div class="mb-3">
                                    <label for="pdfUrl" class="form-label">PDF Link (Optional)</label>
                                    <input type="url" class="form-control" id="pdfUrl" name="pdfUrl" placeholder="e.g., https://example.com/book.pdf">
                                    <div class="form-text">Link to a hosted PDF file.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="hashtags" class="form-label">Hashtags</label>
                                    <input type="text" class="form-control" id="hashtags" name="hashtags" placeholder="#theology #fiction #spiritualgrowth (separate with spaces or commas)">
                                    <div class="form-text">Categorize your books for easy searching.</div>
                                </div>
                                <div class="d-flex justify-content-end">
                                    <button type="reset" class="btn btn-outline-secondary me-2">Clear</button>
                                    <button type="submit" class="btn btn-primary">Save Book</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Previous Books Section -->
                    <div class="mt-5">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3><i class="fas fa-book-reader me-2 text-primary-color"></i>Your Books</h3>
                            <form class="d-flex" action="<%= BASE_PATH %>/books" method="GET">
                                <input type="text" class="form-control form-control-sm me-2" name="search" placeholder="Search books..." value="<%= typeof search !== 'undefined' ? search : '' %>">
                                <button type="submit" class="btn btn-sm btn-primary">Search</button>
                            </form>
                        </div>

                        <% if (books && books.length > 0) { %>
                            <div class="row row-cols-1 g-3">
                                <% books.forEach(book => { %>
                                    <div class="col">
                                        <div class="card shadow-sm">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between align-items-center mb-2">
                                                    <h5 class="card-title mb-0"><a href="<%= book.link || book.pdfUrl || '#' %>" target="_blank" class="text-decoration-none text-primary"><%= book.title %> <% if (book.link || book.pdfUrl) { %><i class="fas fa-external-link-alt fa-xs ms-1"></i><% } %></a></h5>
                                                    <small class="text-muted">by <%= book.author %></small>
                                                </div>
                                                <p class="card-text mb-2"><%= book.notes.substring(0, 150) %><% if (book.notes.length > 150) { %>...<% } %></p>
                                                <% if (book.link || book.pdfUrl) { %>
                                                    <div class="d-flex align-items-center mb-2">
                                                        <% if (book.link) { %>
                                                            <a href="<%= book.link %>" target="_blank" class="me-2 text-decoration-none">
                                                                <i class="fas fa-external-link-alt me-1"></i>Link
                                                            </a>
                                                        <% } %>
                                                        <% if (book.pdfUrl) { %>
                                                            <a href="<%= book.pdfUrl %>" target="_blank" class="text-decoration-none">
                                                                <i class="fas fa-file-pdf me-1"></i>PDF
                                                            </a>
                                                        <% } %>
                                                    </div>
                                                <% } %>
                                                <div class="hashtags mb-3">
                                                    <% book.hashtags.forEach(tag => { %>
                                                        <span class="badge bg-light text-dark me-1">#<%= tag.name %></span>
                                                    <% }); %>
                                                </div>
                                                <div class="d-flex justify-content-end">
                                                    <a href="<%= BASE_PATH %>/books/edit/<%= book.id %>" class="btn btn-sm btn-outline-primary me-2">
                                                        <i class="fas fa-edit me-1"></i>Edit
                                                    </a>
                                                    <button type="button" class="btn btn-sm btn-outline-danger delete-book-btn" data-id="<%= book.id %>">
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
                                <i class="fas fa-book-reader"></i>
                                <h4>No books found</h4>
                                <p class="mb-0">Start cataloging your spiritual library!</p>
                            </div>
                        <% } %>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Delete Confirmation Modal for Books -->
    <div class="modal fade" id="deleteBookModal" tabindex="-1" aria-labelledby="deleteBookModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="deleteBookModalLabel">Confirm Deletion</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete this book entry? This action cannot be undone.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <form id="deleteBookForm" method="POST" action="">
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
            // Delete Confirmation Modal for Books
            const deleteButtons = document.querySelectorAll('.delete-book-btn');
            const deleteBookForm = document.getElementById('deleteBookForm');
            const deleteBookModal = new bootstrap.Modal(document.getElementById('deleteBookModal'));

            deleteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const bookId = this.dataset.id;
                    deleteBookForm.action = `<%= BASE_PATH %>/books/delete/${bookId}`;
                    deleteBookModal.show();
                });
            });
        });
    </script>
</body>
</html>
