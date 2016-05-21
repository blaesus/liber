const gulp = require('gulp')
const ghPages = require('gulp-gh-pages')
const rimraf = require('rimraf')
const cssimport = require("gulp-cssimport")
const cssmin = require('gulp-cssmin')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const inlinesource = require('gulp-inline-source');

gulp.task('copy', () => {
  rimraf.sync('./build/')
  return gulp.src(['./src/**/*'])
    .pipe(gulp.dest('./build/'))
})

gulp.task('import-css', ['copy'], () => {
  const options = {};
  return gulp.src("./build/shared/common.css")
    .pipe(cssimport(options))
    .pipe(gulp.dest("./build/shared"))
})

gulp.task('build', ['copy', 'import-css'], () => {
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
      plugins: ["transform-object-assign"]
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./build'))
})

gulp.task('inline-source-into-html', ['build', 'optimize-css', 'optimize-js'], () => {
  return gulp.src('./build/**/*.html')
    .pipe(inlinesource())
    .pipe(gulp.dest('./build'))
})

gulp.task('make',
  [
    'build',
    'optimize-css',
    'optimize-js',
    'inline-source-into-html',
  ],
  () => {
  }
)

gulp.task('deploy', ['make'], () => {
  rimraf.sync('./build/partials')
  return gulp.src('./build/**/*')
    .pipe(ghPages())
})