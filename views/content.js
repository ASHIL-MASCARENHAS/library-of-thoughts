<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content | Library of Thoughts</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<%= BASE_PATH %>/css/styles.css">
    <link rel="stylesheet" href="<%= BASE_PATH %>/css/home.css"> <!-- Using home.css for general styling -->
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <div class="content-wrapper">
        <!-- Navbar -->
        <%- include('navbar', { activePage: 'content', user: user }); %>

        <!-- Tabs -->
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
                <a class="nav-link" href="<%= BASE_PATH %>/archives">Archives</a>
            </li>
        </ul>

        <!-- Main Content for Content Page -->
        <main class="container my-5">
            <div class="p-5 text-center bg-light rounded-3 shadow-lg">
                <h1 class="display-5 fw-bold text-orange mb-3">Explore Our Content Sections</h1>
                <p class="fs-5 mb-4 text-muted">
                    Navigate through various categories of spiritual resources and personal reflections.
                </p>
            </div>

            <div class="row g-4 py-5 row-cols-1 row-cols-md-2 row-cols-lg-3">
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <i class="fas fa-calendar-alt text-orange mb-3" style="font-size: 2.5rem;"></i>
                            <h5 class="card-title text-orange">Liturgical Calendar</h5>
                            <p class="card-text text-muted">Daily readings, seasons, and your personal reflections tied to the Church year.</p>
                            <a href="<%= BASE_PATH %>/liturgicalCalendar" class="btn btn-sm btn-outline-primary">Go to Calendar</a>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <i class="fas fa-lightbulb text-orange mb-3" style="font-size: 2.5rem;"></i>
                            <h5 class="card-title text-orange">Insights</h5>
                            <p class="card-text text-muted">General thoughts, spiritual insights, and non-daily reflections.</p>
                            <a href="<%= BASE_PATH %>/insights" class="btn btn-sm btn-outline-primary">View Insights</a>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <i class="fas fa-book-open text-orange mb-3" style="font-size: 2.5rem;"></i>
                            <h5 class="card-title text-orange">Anecdotes</h5>
                            <p class="card-text text-muted">Discover inspiring stories and short narratives that uplift the spirit.</p>
                            <a href="<%= BASE_PATH %>/anecdotes" class="btn btn-sm btn-outline-primary">View Anecdotes</a>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <i class="fas fa-book-reader text-orange mb-3" style="font-size: 2.5rem;"></i>
                            <h5 class="card-title text-orange">Books</h5>
                            <p class="card-text text-muted">Find recommendations, PDFs, and notes on spiritual books.</p>
                            <a href="<%= BASE_PATH %>/books" class="btn btn-sm btn-outline-primary">Browse Books</a>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <i class="fas fa-link text-orange mb-3" style="font-size: 2.5rem;"></i>
                            <h5 class="card-title text-orange">Web-Links</h5>
                            <p class="card-text text-muted">Curated list of external spiritual resources and websites.</p>
                            <a href="<%= BASE_PATH %>/weblinks" class="btn btn-sm btn-outline-primary">Explore Links</a>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <i class="fas fa-language text-orange mb-3" style="font-size: 2.5rem;"></i>
                            <h5 class="card-title text-orange">Grammar</h5>
                            <p class="card-text text-muted">Resources for understanding biblical languages and theological terms.</p>
                            <a href="<%= BASE_PATH %>/grammar" class="btn btn-sm btn-outline-primary">Study Grammar</a>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <i class="fas fa-archive text-orange mb-3" style="font-size: 2.5rem;"></i>
                            <h5 class="card-title text-orange">Archives</h5>
                            <p class="card-text text-muted">Access older insights and custom content that have been archived.</p>
                            <a href="<%= BASE_PATH %>/archives" class="btn btn-sm btn-outline-primary">View Archives</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Footer -->
    <%- include('footer'); %>

    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
