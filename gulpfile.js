const gulp = require('gulp')
const ghPages = require('gulp-gh-pages')
const rimraf = require('rimraf')
const cssimport = require("gulp-cssimport")
const cssmin = require('gulp-cssmin')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const inlinesource = require('gulp-inline-source')
const include = require("gulp-include")
const htmlmin = require('gulp-htmlmin')

gulp.task('copy', () => {
  rimraf.sync('./build/')
  return gulp.src(['./src/**/*'])
    .pipe(gulp.dest('./build/'))
})

gulp.task('insert-html-partials', ['copy'], () => {
  gulp.src('./build/**/*.html')
    .pipe(include({
      extensions: 'html',
    }))
    .pipe(gulp.dest('./build'))
})

gulp.task('build', ['copy', 'insert-html-partials'], () => {
})

gulp.task('import-css', ['copy'], () => {
  const options = {};
  return gulp.src("./build/shared/common.css")
    .pipe(cssimport(options))
    .pipe(gulp.dest("./build/shared"))
})

gulp.task('optimize-css', ['import-css'], () => {
  return gulp.src('./build/**/*.css')
    .pipe(cssmin())
    .pipe(autoprefixer({
      browsers: ['ie >= 8', 'last 3 versions'],
    }))
    .pipe(gulp.dest('./build'))
})

gulp.task('optimize-js', ['copy'], () => {
  return gulp.src('./build/**/*.js')
    .pipe(babel({
      presets: ['es2015'],
      plugins: ['transform-object-assign'],
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./build'))
})

gulp.task('inline-source-into-html', ['build', 'insert-html-partials', 'import-css', 'optimize-css', 'optimize-js'], () => {
  return gulp.src('./build/**/*.html')
    .pipe(inlinesource())
    .pipe(gulp.dest('./build'))
})

gulp.task('minify-html', ['inline-source-into-html'], () => {
  return gulp.src('./build/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('./build'))
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
  rimraf.sync('./build/partials')
  return gulp.src('./build/**/*')
    .pipe(ghPages())
})