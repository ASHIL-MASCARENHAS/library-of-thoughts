<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Liturgical Calendar | Library of Thoughts</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<%= BASE_PATH %>/css/styles.css">
    <link rel="stylesheet" href="<%= BASE_PATH %>/css/liturgicalCalendar.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="content-wrapper">
        <!-- Navbar Section -->
        <%- include('navbar', { activePage: 'liturgicalCalendar', user: user }); %>

        <!-- Navigation Tabs -->
        <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="<%= BASE_PATH %>/liturgicalCalendar">Liturgical Calendar</a>
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
        <div class="container main-content mt-4">
            <!-- Liturgical Calendar Header -->
            <div class="liturgical-banner text-center mb-4">
                <h2 class="display-5 fw-bold mb-3"><i class="fas fa-calendar-alt me-3"></i>Liturgical Calendar</h2>
                <p class="lead mb-0">Explore the daily readings, liturgical seasons, and colors of the Church year.</p>
            </div>

            <div class="row">
                <!-- Date Picker and Liturgical Info Column -->
                <div class="col-lg-5 mb-4">
                    <!-- Date Selection Card -->
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-calendar-day me-2"></i>Select a Date
                        </div>
                        <div class="card-body">
                            <form action="<%= BASE_PATH %>/liturgicalCalendar" method="GET" class="row g-2 align-items-end">
                                <div class="col-md-8">
                                    <label for="date-input" class="form-label visually-hidden">Date</label>
                                    <input type="date" class="form-control date-picker" id="date-input" name="date" required value="<%= requestedDate %>">
                                </div>
                                <div class="col-md-4">
                                    <button type="submit" class="btn btn-primary w-100">
                                        <i class="fas fa-search me-1"></i>Fetch
                                    </button>
                                </div>
                            </form>
                            <hr class="my-3">
                            <button type="button" class="btn btn-outline-primary w-100" id="today-button">
                                <i class="fas fa-sync-alt me-1"></i>View Today
                            </button>
                        </div>
                    </div>

                    <!-- Liturgical Details Card -->
                    <% if (info) { %>
                        <div class="card shadow-sm liturgical-card">
                            <div class="card-header bg-primary text-white">
                                <i class="fas fa-church me-2"></i>Liturgical Details for <%= new Date(requestedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) %>
                            </div>
                            <div class="card-body">
                                <p class="mb-2"><strong>Weekday:</strong> <%= info.weekday %></p>
                                <p class="mb-2"><strong>Season:</strong> <span class="liturgical-info-badge <%= info.season.toLowerCase().replace(/\s/g, '-') %>"><%= info.season %></span> (Week <%= info.season_week %>)</p>
                                <p class="mb-2"><strong>Liturgical Year:</strong> <%= info.liturgical_year %></p>
                                <% if (info.celebrations && info.celebrations.length > 0) { %>
                                    <h6 class="mt-3">Celebrations:</h6>
                                    <% info.celebrations.forEach(c => { %>
                                        <div class="d-flex align-items-center mb-2">
                                            <span class="liturgical-color-preview" style="background-color: <%= c.colour %>;"></span>
                                            <p class="mb-0"><strong><%= c.title %></strong> (<%= c.rank %>) - <%= c.colour %></p>
                                        </div>
                                    <% }); %>
                                <% } else { %>
                                    <p class="mt-3">No special celebration for this day.</p>
                                <% } %>
                            </div>
                        </div>
                    <% } else { %>
                        <div class="card shadow-sm liturgical-card">
                            <div class="card-header bg-primary text-white">
                                <i class="fas fa-church me-2"></i>Liturgical Details
                            </div>
                            <div class="card-body">
                                <div class="alert alert-info mb-0" role="alert">
                                    <i class="fas fa-info-circle me-2"></i>Select a date to view its liturgical information.
                                </div>
                            </div>
                        </div>
                    <% } %>
                </div>

                <!-- Bible Readings and Reflections Column -->
                <div class="col-lg-7 mb-4">
                    <!-- Bible Readings Card -->
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <div><i class="fas fa-bible me-2"></i>Daily Bible Readings</div>
                        </div>
                        <div class="card-body">
                            <% if (info && info.readings && info.readings.length > 0) { %>
                                <% info.readings.forEach(r => { %>
                                    <div class="reading-item">
                                        <h6><i class="fas fa-book-reader me-1 text-primary-color"></i> <%= r.reading %>: <%= r.citation %></h6>
                                        <% if (r.verses && r.verses.length > 0) { %>
                                            <% r.verses.forEach(v => { %>
                                                <p class="mb-1"><span class="fw-bold"><%= v.book_name %> <%= v.chapter %>:<%= v.verse %></span> - <%= v.text %></p>
                                            <% }); %>
                                        <% } %>
                                    </div>
                                <% }); %>
                            <% } else { %>
                                <div class="alert alert-warning mb-0" role="alert">
                                    <i class="fas fa-exclamation-triangle me-2"></i>No readings available for the selected date.
                                </div>
                            <% } %>
                        </div>
                    </div>

                    <!-- Daily Reflection Form Card -->
                    <div class="card shadow-sm reflection-card mb-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-pen me-2"></i>Your Daily Reflection for <%= new Date(requestedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) %>
                        </div>
                        <div class="card-body">
                            <form id="addReflectionForm" action="<%= BASE_PATH %>/liturgicalCalendar/reflect" method="POST">
                                <input type="hidden" name="date" value="<%= requestedDate %>">
                                <div class="mb-3">
                                    <label for="reflectionDescription" class="form-label">Share your thoughts on today's readings</label>
                                    <textarea class="form-control" id="reflectionDescription" name="description" rows="4" placeholder="What moved you in today's scriptures?" required></textarea>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="reflectionHashtags" class="form-label">Hashtags (for later searching)</label>
                                    <input type="text" class="form-control" id="reflectionHashtags" name="hashtags" placeholder="#faith #hope #love (separate with spaces or commas)">
                                    <div class="form-text">Categorize your reflection for easy retrieval.</div>
                                </div>
                                
                                <div class="d-flex justify-content-end">
                                    <button type="reset" class="btn btn-outline-secondary me-2">Clear</button>
                                    <button type="submit" class="btn btn-primary">Save Reflection</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Display Today's Reflections -->
                    <div class="mt-4">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3><i class="fas fa-calendar-day me-2 text-primary-color"></i>Reflections for <%= new Date(requestedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) %></h3>
                        </div>
                        
                        <% if (dailyReflections && dailyReflections.length > 0) { %>
                            <div class="row row-cols-1 g-3">
                                <% dailyReflections.forEach(reflection => { %>
                                    <div class="col">
                                        <div class="card shadow-sm">
                                            <div class="card-body">
                                                <div class="d-flex justify-content-between align-items-center mb-2">
                                                    <small class="text-muted"><%= reflection.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) %></small>
                                                    <div class="hashtags">
                                                        <% reflection.hashtags.forEach(tag => { %>
                                                            <span class="badge bg-light text-dark me-1">#<%= tag.name %></span>
                                                        <% }); %>
                                                    </div>
                                                </div>
                                                <p class="card-text"><%= reflection.description %></p>
                                                <div class="d-flex justify-content-end mt-3">
                                                    <a href="<%= BASE_PATH %>/liturgicalCalendar/reflect/edit/<%= reflection.id %>?date=<%= requestedDate %>" class="btn btn-sm btn-outline-primary me-2">
                                                        <i class="fas fa-edit me-1"></i>Edit
                                                    </a>
                                                    <button type="button" class="btn btn-sm btn-outline-danger delete-reflection-btn" data-id="<%= reflection.id %>" data-date="<%= requestedDate %>">
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
                                <i class="fas fa-pen-fancy"></i>
                                <h4>No reflections yet for this day</h4>
                                <p class="mb-0">Share your thoughts above to begin your spiritual journal for this date.</p>
                            </div>
                        <% } %>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal for Daily Reflections -->
    <div class="modal fade" id="deleteReflectionModal" tabindex="-1" aria-labelledby="deleteReflectionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="deleteReflectionModalLabel">Confirm Deletion</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete this daily reflection? This action cannot be undone.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <form id="deleteReflectionForm" method="POST" action="">
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
            // "View Today" button functionality
            document.getElementById('today-button').addEventListener('click', function() {
                const dateInput = document.getElementById('date-input');
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day}`;
                dateInput.value = formattedDate;
                dateInput.closest('form').action = '<%= BASE_PATH %>/liturgicalCalendar'; // Ensure form action is correct
                dateInput.closest('form').submit();
            });

            // Add liturgical color preview to badges
            document.querySelectorAll('.liturgical-info-badge').forEach(badge => {
                const season = badge.textContent.trim().toLowerCase();
                let colorClass = '';
                switch (season) {
                    case 'advent':
                    case 'lent':
                        colorClass = 'liturgical-purple';
                        break;
                    case 'ordinary time':
                        colorClass = 'liturgical-green';
                        break;
                    case 'christmas':
                    case 'easter':
                        colorClass = 'liturgical-white';
                        break;
                    // The original code had 'martyr' and 'passion' here, which are not seasons.
                    // Assuming these were meant for specific celebration colors, not season badges.
                    // If they are meant to be season-like, please clarify.
                    case 'red': // Assuming 'red' might be a season color in some contexts
                        colorClass = 'liturgical-red';
                        break;
                    case 'gold':
                        colorClass = 'liturgical-gold';
                        break;
                    case 'rose':
                        colorClass = 'liturgical-rose';
                        break;
                    default:
                        break;
                }
                if (colorClass) {
                    badge.classList.add(colorClass);
                }
            });

            // Apply liturgical colors to celebration badges
            // This is for the badges within the "Celebrations" section
            const colorBadges = document.querySelectorAll('.liturgical-color-preview');
            colorBadges.forEach(badge => {
                const color = badge.dataset.color; // Assuming you add data-color to these spans in the EJS
                let colorClass = '';
                switch (color) {
                    case 'violet':
                    case 'purple':
                        colorClass = 'liturgical-purple';
                        break;
                    case 'green':
                        colorClass = 'liturgical-green';
                        break;
                    case 'white':
                        colorClass = 'liturgical-white';
                        break;
                    case 'red':
                    case 'martyr':
                    case 'passion':
                        colorClass = 'liturgical-red';
                        break;
                    case 'gold':
                        colorClass = 'liturgical-gold';
                        break;
                    case 'rose':
                        colorClass = 'liturgical-rose';
                        break;
                    default:
                        break;
                }
                if (colorClass) {
                    badge.classList.add(colorClass);
                }
            });


            // Delete Confirmation Modal for Daily Reflections
            const deleteReflectionButtons = document.querySelectorAll('.delete-reflection-btn');
            const deleteReflectionForm = document.getElementById('deleteReflectionForm');
            const deleteReflectionModal = new bootstrap.Modal(document.getElementById('deleteReflectionModal'));

            deleteReflectionButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const reflectionId = this.dataset.id;
                    // Ensure reflectionDate is correctly passed for the delete action
                    const reflectionDate = this.dataset.date; 
                    deleteReflectionForm.action = `<%= BASE_PATH %>/liturgicalCalendar/reflect/delete/${reflectionId}?date=${reflectionDate}`;
                    deleteReflectionModal.show();
                });
            });
        });
    </script>
</body>
</html>
