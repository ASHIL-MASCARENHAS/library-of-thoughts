<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Insight | Library of Thoughts</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="/css/insights.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="content-wrapper">
        <!-- Navbar Section -->
        <%- include('navbar', { activePage: 'insights', user: user }); %>

        <!-- Main Content Area -->
        <div class="container main-content mt-4">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card shadow-sm">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-edit me-2"></i>Edit Insight
                        </div>
                        <div class="card-body">
                            <form method="post" action="/insights/update/<%= insight.id %>">
                                <div class="mb-3">
                                    <label for="description" class="form-label">Description</label>
                                    <textarea class="form-control" id="description" name="description" rows="4" required><%= insight.description %></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="hashtags" class="form-label">Hashtags</label>
                                    <input type="text" class="form-control" id="hashtags" name="hashtags" 
                                        value="<%= insight.hashtags.map(tag => `#${tag.name}`).join(' ') %>">
                                    <div class="form-text">Separate with spaces or commas</div>
                                </div>
                                
                                <div class="d-flex justify-content-between">
                                    <a href="/insights" class="btn btn-outline-secondary">Cancel</a>
                                    <div>
                                        <button type="submit" class="btn btn-primary me-2">Update</button>
                                        <button type="button" class="btn btn-danger delete-insight-btn" data-id="<%= insight.id %>">
                                            <i class="fas fa-trash-alt me-1"></i>Delete
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
            const deleteButton = document.querySelector('.delete-insight-btn');
            const deleteInsightForm = document.getElementById('deleteInsightForm');
            const deleteInsightModal = new bootstrap.Modal(document.getElementById('deleteInsightModal'));

            if (deleteButton) {
                deleteButton.addEventListener('click', function() {
                    const insightId = this.dataset.id;
                    deleteInsightForm.action = `/insights/delete/${insightId}`;
                    deleteInsightModal.show();
                });
            }
        });
    </script>
</body>
</html>
