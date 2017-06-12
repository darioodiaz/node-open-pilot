var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat');

// Concatenate & Minify JS
gulp.task('scripts', function() {
	return gulp.src(['js/helpers.js','js/socketFunctions.js','js/joystickFunctions.js','js/renderFunctions.js','js/app.js'])
		.pipe(concat('all.js'))
		.pipe(rename('build.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts']);
