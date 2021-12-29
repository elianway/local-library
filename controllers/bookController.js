const { PrismaClient } = require('@prisma/client')
const { body, validationResult } = require('express-validator')

const prisma = new PrismaClient()
const async = require('async')

exports.index = function(req, res) {
    async.parallel({
        book_count: function(callback) {
            prisma.book.count({}, callback)
        },
        book_instance_count: function(callback) {
            prisma.bookinstance.count({}, callback)
        },
        book_instance_available_count: function(callback) {
            prisma.bookinstance.count({
                where: {
                  status: 'Available'
                },
            }, callback)
        },
        author_count: function(callback) {
            prisma.author.count({}, callback)
        },
        genre_count: function(callback) {
            prisma.genre.count({}, callback)
        }
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results })
    })
}

// Display list of all books.
exports.book_list = function(req, res, next) {
    prisma.book.findMany({
        orderBy: {
            title: 'asc',
        },
        select: {
            title: true,
            author: true,
        },
        include: {
            author: true,
        },
    }, function(err, list_books) {
        if (err) { return next(err); }
        res.render('book_list', { title: 'Book List', book_list: list_books });
    });
};

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {
    async.parallel({
        book: function(callback) {
            prisma.book.findUnique({
                where: {
                    id: req.params.id
                },
            }, callback);
        },
        book_instance: function(callback) {
            prisma.bookInstance.findMany({
                where: {
                    bookId: req.params.id
                },
            }, callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) {
            const err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instance });
    });        
};

// Display book create form on GET.
exports.book_create_get = function(req, res, next) {
   
    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        authors: function(callback) {
            prisma.author.findMany({}, callback);
        }, 
        genres: function(callback) {
            prisma.genre.findMany({}, callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });

};

// Handle book create on POST.
exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if (!(req.body.genre.instanceOf(Array))) {
            if (typeof req.body.genre === 'undefined')
                req.body.genre = [];
                else
                req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitize the fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from the request.
        const errors = validationResult(req);

        // Create a book object with escaped and trimmed data.
        var book = {
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        }

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    prisma.authors.findMany({}, callback);
                },
                genres: function(callback) {
                    prisma.genres.findMany({}, callback);
                },
            }, function(e, results) {
                if (e) { return next(e); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i].id > -1)) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            try {
                const newBook = await prisma.book.create({ data: book });
                res.redirect(newBook.id);
            }
            catch (e) {
                if (e) { return next(e); }
            }
        }
    }

];

// Display book delete form on GET.
exports.book_delete_get = function(req, res) {

};

// Handle book delete on POST.
exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {

    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback) {
            prisma.book.findUnique({
                where: {
                    id: req.params.id
                },
                include: {
                    author: true,
                    genre: true,
                },
            }, callback)
        },
        authors: function(callback) {
            prisma.author.findMany({}, callback)
        },
        genres: function(callback) {
            prisma.genre.findMany({}, callback)
        },
    }, function(e, results) {
        if (e) { return next(e); }
        if (results.book==null) { // No results.
            const e = new Error('Book not found');
            e.status = 404;
            return next(e);
        }
        // Success
        // Mark our selected genres as checked.
        for (let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (let book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                if (results.genres[all_g_iter].id.toString()===results.book.genre[book_g_iter].id.toString()) {
                    results.genres[all_g_iter].checked='true';
                }
            }
        }
        res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });
    });
};

// Handle book update on POST.
exports.book_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if (!(req.body.genre.instanceOf(Array))) {
            if (typeof req.body.genre==='undefined')
            req.body.genre = [];
            else
            req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitize fields
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id
        const book = {
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            id: req.params.id // This is required, or a new id will be assigned.
        };

        if (!errors.isEmpty()) {
            // There are errors. Render form again with santized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    prisma.author.findMany({}, callback)
                },
                genres: function(callback) {
                    prisma.genre.findMany({}, callback)
                },
            }, function(e, results) {
                if (e) { return next(e); }

                // Mark our genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i].id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from the form is valid. Update the record.
            try {
                await prisma.book.update({
                    where: {
                        id: req.params.id
                    },
                    data: book,
                })
                res.redirect(book.id);
            }
            catch (e) {
                if (e) { return next(e); }
            }
        }
    }
];
