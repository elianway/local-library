const { PrismaClient } = require('@prisma/client')
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
      });
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
      });
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
  res.send('NOT IMPLEMENTED: Author create GET');
};

exports.author_create_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author create POST');
};

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
