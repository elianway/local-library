const { PrismaClient } = require('@prisma/client')
const { body, validationResult } = require('express-validator')
const async = require('async')
const prisma = new PrismaClient()

exports.author_list = function(req, res, next) {
  prisma.author.findMany({
    orderBy: {
      title: 'asc',
    },
  }, function(err, list_authors) {
    if (err) { return next(err); }
    res.render('author_list', { title: 'Author List', author_list: list_authors });
  });
};

exports.author_detail = function(req, res, next) {
  async.parallel({
    author: function(callback) {
      prisma.author.findUnique({
        where: {
          id: req.params.id,
        },
      }, callback);
    },
    author_books: function(callback) {
      prisma.book.findUnique({
        where: {
          author: req.params.id,
        },
        select: {
          title: true,
          summary: true,
        },
      }, callback);
    },
  }, function(err, results) {
    if (err) { return next(err); }
    if (results.author==null) {
      const err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.author_books } );
  }); 
};

exports.author_create_get = function(req, res) {
  res.render('author_form', { title: 'Create Author'});
};

exports.author_create_post = [
  
  // Validate and sanitize fields.
  body('first_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('Field must contain only letters or numbers.'),
  body('family_name').trim().isLength({ min: 1 }).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('Field must contain only letters or numbers.'),
  body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid.
      try {
        const newAuthor = await prisma.author.create({
          data: {
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            bornOn: req.body.date_of_birth,
            diedOn: req.body.date_of_death
          },
        });
        res.redirect(newAuthor.id);
      }
      catch (e) {
        if (e) { return next(e); }
      }
    }
  }
];


exports.author_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author delete GET');
};

exports.author_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author delete POST');
};

exports.author_update_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author update GET');
};

exports.author_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author update POST');
};
