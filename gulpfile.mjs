import gulp from 'gulp';
import open from 'gulp-open';

// Task to open the browser
gulp.task('open-app', function(){
  gulp.src('pages/dashboard.html')
  .pipe(open());
});

gulp.task('open-asansor', function(){
  return gulp.src('pages/asansor.html')
    .pipe(open());
});