const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const prisma = new PrismaClient();
const async = require('async');

// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    prisma.genre.findMany({
        orderBy: {
            name: 'asc',
        },
    }, function(err, list_genre) {
        if (err) { next(err); }
        res.render('genre_list', { title: 'Genre List', genre_list: list_genre });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: function(callback) {
            prisma.genre.findUnique({
                where: {
                    id: req.params.id
                },
            });
        },
        genre_books: function(callback) {
            prisma.book.findMany({
                where: {
                    genId: req.params.id
                },
            });
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) {
            const err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
    });        
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', { title: 'Create Genre' }) 
};

// Handle Genre create on POST.
exports.genre_create_post = [

    // Validate and sanitize the name field.
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        const genre = { name: req.body.name };

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if genre with same name already exists.
            try {
                const found_genre = await prisma.genre.findUnique({
                    where: {
                        name: req.body.name
                    },
                });
                if (found_genre) {
                    // Genre exists, redirect to detail page.
                    res.redirect(found_genre.id);
                } else {
                    try {
                        await prisma.genre.create({
                            data: genre
                        });
                    }
                    catch (e) {
                        if (e) { return next(e); };
                    }
                }
            } catch {
                if (e) {
                    return next(e);
                }
            }
        }
      }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};
