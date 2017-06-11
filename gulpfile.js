const gulp = require('gulp')
const rimraf = require('rimraf')
const cssimport = require("gulp-cssimport")
const cssmin = require('gulp-cssmin')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const inlinesource = require('gulp-inline-source')
const include = require("gulp-include")
const htmlmin = require('gulp-htmlmin')
const watch = require('gulp-watch')
const webserver = require('gulp-webserver')
const shell = require('gulp-shell')


gulp.task('copy', () => {
  rimraf.sync('./.built/**/*')
  return gulp.src(['./src/**/*'])
    .pipe(gulp.dest('./.built/'))
})

gulp.task('insert-html-partials', ['copy'], () => {
  return gulp.src('./.built/**/*.html', {base: "./"})
    .pipe(include({
      extensions: 'html',
    }))
    .pipe(gulp.dest('.'))
})

gulp.task('build', ['copy', 'insert-html-partials'], () => {
})

gulp.task('import-css', ['copy'], () => {
  const options = {};
  return gulp.src("./.built/shared/common.css")
    .pipe(cssimport(options))
    .pipe(gulp.dest("./.built/shared"))
})

gulp.task('optimize-css', ['import-css'], () => {
  return gulp.src('./.built/**/*.css')
    .pipe(cssmin())
    .pipe(autoprefixer({
      browsers: ['ie >= 8', 'last 3 versions'],
    }))
    .pipe(gulp.dest('./.built'))
})

gulp.task('optimize-js', ['copy'], () => {
  return gulp.src('./.built/**/*.js')
    .pipe(babel({
      presets: ['es2015', 'es2016', 'es2017'],
      plugins: ['transform-object-assign'],
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./.built'))
})

gulp.task('inline-source-into-html', ['build', 'import-css', 'optimize-css', 'optimize-js'], () => {
  rimraf.sync('.built/template')
  rimraf.sync('.built/shared/partials')
  return gulp.src('./.built/**/*.html')
    .pipe(inlinesource())
    .pipe(gulp.dest('./.built'))
})

gulp.task('minify-html', ['inline-source-into-html'], () => {
  return gulp.src('./.built/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./.built'))
})

gulp.task('make',
  [
    'build',
    'optimize-css',
    'optimize-js',
    'inline-source-into-html',
    'minify-html',
  ],
  () => {
  }
)

gulp.task('deploy', ['make'], () => {
  shell.task('rsync -azP .built/* ${HOME_SERVER}:/var/www/html')
})

gulp.task('dev', () => {
  gulp.src('./.built')
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true,
    }))
  gulp.watch('./src/**/*', ['build'])
})