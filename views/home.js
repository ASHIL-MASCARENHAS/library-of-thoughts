<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home | Library of Thoughts</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<%= BASE_PATH %>/css/styles.css">
    <link rel="stylesheet" href="<%= BASE_PATH %>/css/home.css">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Navbar Section -->
    <%- include('navbar', { activePage: 'home', user: user }); %>

    <!-- Main Content Area -->
    <div class="content-wrapper">
        <header class="masthead text-center text-white d-flex" style="background: linear-gradient(to bottom, rgba(106, 17, 203, 0.7) 0%, rgba(67, 4, 125, 0.7) 100%), url('https://placehold.co/1920x1080/6a11cb/ffffff?text=SPIRITUAL+JOURNEY'); background-size: cover; height: 100vh; display: flex; align-items: center; justify-content: center;">
            <div class="container my-auto">
                <div class="row">
                    <div class="col-lg-10 mx-auto">
                        <h1 class="text-uppercase">
                            <strong>A Library for Your Spiritual Thoughts</strong>
                        </h1>
                        <hr class="divider my-4">
                    </div>
                    <div class="col-lg-8 mx-auto">
                        <p class="text-white-75 font-weight-light mb-5">Organize your reflections, insights, and resources for a deeper spiritual journey.</p>
                        <a class="btn btn-primary btn-xl" href="<%= BASE_PATH %>/liturgicalCalendar">Start Exploring</a>
                    </div>
                </div>
            </div>
        </header>
    </div>

    <!-- Footer Section -->
    <%- include('footer'); %>

    <!-- Bootstrap JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
