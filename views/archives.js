<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Archives | Library of Thoughts</title>
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
        <%- include('navbar', { activePage: 'archives', user: user }); %>

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
                <a class="nav-link" href="<%= BASE_PATH %>/weblinks">Web-Links</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="<%= BASE_PATH %>/grammar">Grammar</a>
            </li>
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="<%= BASE_PATH %>/archives">Archives</a>
            </li>
        </ul>

        <!-- Main Content Area -->
        <main class="container main-content mt-4">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <!-- Archives Header -->
                    <div class="liturgical-banner text-center mb-4">
                        <h2 class="display-5 fw-bold mb-3"><i class="fas fa-archive me-3"></i>Your Archives</h2>
                        <p class="lead mb-0">A centralized place for all your saved spiritual content.</p>
                    </div>

                    <!-- Explore Content Section -->
                    <div class="card shadow-sm mb-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-folder-open me-2"></i>Explore Your Content
                        </div>
                        <div class="card-body">
                            <p class="card-text">From here, you can navigate to different sections of your archived thoughts and resources:</p>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <a href="<%= BASE_PATH %>/liturgicalCalendar" class="text-decoration-none text-primary fw-bold">Liturgical Calendar Reflections</a>
                                    <i class="fas fa-calendar-day text-muted"></i>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <a href="<%= BASE_PATH %>/insights" class="text-decoration-none text-primary fw-bold">Insights</a>
                                    <i class="fas fa-lightbulb text-muted"></i>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <a href="<%= BASE_PATH %>/anecdotes" class="text-decoration-none text-primary fw-bold">Anecdotes</a>
                                    <i class="fas fa-book-open text-muted"></i>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <a href="<%= BASE_PATH %>/books" class="text-decoration-none text-primary fw-bold">Books</a>
                                    <i class="fas fa-book-reader text-muted"></i>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <a href="<%= BASE_PATH %>/weblinks" class="text-decoration-none text-primary fw-bold">Web-Links</a>
                                    <i class="fas fa-link text-muted"></i>
                                </li>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <a href="<%= BASE_PATH %>/grammar" class="text-decoration-none text-primary fw-bold">Grammar</a>
                                    <i class="fas fa-spell-check text-muted"></i>
                                </li>
                            </ul>
                            <p class="mt-3 mb-0 text-muted">This section can be expanded in the future to offer more advanced filtering or a consolidated view of all your entries.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Footer Section -->
    <%- include('footer'); %>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
