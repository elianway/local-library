const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    prisma.bookinstance.findMany({
        select: {
            book: true,
        },
        include: {
            book: true,
        },
    }, function (err, list_bookinstances) {
        if (err) { return next(err); }
        res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    prisma.bookinstance.findUnique({
        where: {
            id: req.params.id,
        },
        include: {
            book: true,
        },
    }, function(err, bookinstance) {
        if (err) { return next(err); }
        if (bookinstance==null) {
            var err = new Error('Book copy not found');
            err.status = 404;
            return next(err);
        }
        res.render('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance: bookinstance});
    })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
    try {
        const books = await prisma.book.findMany({ orderBy: { title: 'asc', }, });
        res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books });
    }
    catch (e) {
        if (e) { return next(e); };
    }
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate and santise the fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('status').escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        const bookinstance = {
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        };

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            try {
                const books = await prisma.book.findMany({ orderBy: { 'title': 'asc', }, });
                res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book.id, errors: errors.array(), bookinstance: bookinstance });
            }
            catch (e) {
                if (e) { return next(e); };
            }
            return;
        }
        else {
            // Data from the form is valid.
            try {
                const newBookInstance = await prisma.bookinstance.create({ data: bookinstance });
                res.redirect(newBookInstance.id);
            }
            catch (e) {
                if (e) { return next(e); };
            }
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};
