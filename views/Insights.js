<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insights | Library of Thoughts</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<%= BASE_PATH %>/css/styles.css">
    <link rel="stylesheet" href="<%= BASE_PATH %>/css/insights.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="content-wrapper">
        <!-- Navbar Section -->
        <%- include('navbar', { activePage: 'insights', user: user }); %>

        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/liturgicalCalendar">Liturgical Calendar</a>
            </li>
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="<%= BASE_PATH %>/insights">Insights</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/anecdotes">Anecdotes</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/books">Books</a>
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
                    <!-- Add New Insight Form -->
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-lightbulb me-2"></i>Add New Insight
                        </div>
                        <div class="card-body">
                            <form action="<%= BASE_PATH %>/insightsCreate" method="POST">
                                <div class="mb-3">
                                    <label for="description" class="form-label">Insight Description</label>
                                    <textarea class="form-control" id="description" name="description" rows="4" placeholder="Write your insight here..." required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="hashtags" class="form-label">Hashtags</label>
                                    <input type="text" class="form-control" id="hashtags" name="hashtags" placeholder="#faith #love #hope (separate with spaces or commas)">
                                    <div class="form-text">Use hashtags to categorize your insights for easy searching.</div>
                                </div>
                                <div class="d-flex justify-content-end">
                                    <button type="reset" class="btn btn-outline-secondary me-2">Clear</button>
                                    <button type="submit" class="btn btn-primary">Save Insight</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Previous Insights Section -->
                    <div class="mt-5">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3><i class="fas fa-history me-2 text-primary-color"></i>Previous Insights</h3>
                            <form class="d-flex" action="<%= BASE_PATH %>/insights" method="GET">
                                <input type="text" class="form-control form-control-sm me-2" name="search" placeholder="Search insights..." value="<%= typeof search !== 'undefined' ? search : '' %>">
                                <button type="submit" class="btn btn-sm btn-primary">Search</button>
                            </form>
                        </div>

                        <% if (insights && insights.length > 0) { %>
                            <div class="row row-cols-1 g-3">
                                <% insights.forEach(insight => { %>
                                    <div class="col">
                                        <div class="card shadow-sm">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between align-items-center mb-2">
                                                    <small class="text-muted"><%= insight.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) %></small>
                                                    <div class="hashtags">
                                                        <% insight.hashtags.forEach(tag => { %>
                                                            <span class="badge bg-light text-dark me-1">#<%= tag.name %></span>
                                                        <% }); %>
                                                    </div>
                                                </div>
                                                <p class="card-text"><%= insight.description %></p>
                                                <div class="d-flex justify-content-end mt-3">
                                                    <a href="<%= BASE_PATH %>/insights/edit/<%= insight.id %>" class="btn btn-sm btn-outline-primary me-2">
                                                        <i class="fas fa-edit me-1"></i>Edit
                                                    </a>
                                                    <button type="button" class="btn btn-sm btn-outline-danger delete-insight-btn" data-id="<%= insight.id %>">
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
                                <i class="fas fa-lightbulb"></i>
                                <h4>No insights found</h4>
                                <p class="mb-0">Start adding your spiritual insights to build your personal archive.</p>
                            </div>
                        <% } %>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Delete Confirmation Modal for Insights -->
    <div class="modal fade" id="deleteInsightModal" tabindex="-1" aria-labelledby="deleteInsightModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="deleteInsightModalLabel">Confirm Deletion</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete this insight? This action cannot be undone.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <form id="deleteInsightForm" method="POST" action="">
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
            // Delete Confirmation Modal for Insights
            const deleteButtons = document.querySelectorAll('.delete-insight-btn');
            const deleteInsightForm = document.getElementById('deleteInsightForm');
            const deleteInsightModal = new bootstrap.Modal(document.getElementById('deleteInsightModal'));

            deleteButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const insightId = this.dataset.id;
                    deleteInsightForm.action = `<%= BASE_PATH %>/insights/delete/${insightId}`;
                    deleteInsightModal.show();
                });
            });
        });
    </script>
</body>
</html>
