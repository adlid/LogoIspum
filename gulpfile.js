const {src, dest, watch, parallel, series, task} = require('gulp');
const scss = require('gulp-sass'),
	pug = require('gulp-pug'),
	path = require('path'),
	fs = require('fs'),
	del = require('del'),
	cheerio = require('gulp-cheerio'),
	svgmin = require('gulp-svgmin'),
	svgstore = require('gulp-svgstore'),
	replace = require('gulp-replace'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync').create(),
	uglify = require('gulp-uglify-es').default;

function html() {
	return src('src/index.pug')
		.pipe(pug())
		.pipe(dest('dist'))
		.pipe(browserSync.stream());
}

function styles() {
	return src('src/scss/*.scss')
		.pipe(scss({outputStyle: 'compressed'}))
		.pipe(rename({suffix: '.min'}))
		.pipe(dest('dist/css'))
		.pipe(browserSync.stream());
}

function scripts() {
	return src('src/js/script.js')
		.pipe(uglify())
		.pipe(rename({suffix: '.min'}))
		.pipe(dest('dist/js'))
		.pipe(browserSync.stream());
}

function copyLibsScripts() {
	return src('src/js/libs/*/**')
		.pipe(dest('dist/js/libs'))
		.pipe(browserSync.stream());
}

function images() {
	return src('src/images/**/*.*')
		.pipe(dest('dist/images'))
		.pipe(browserSync.stream());
}

function svg() {
	return src("src/icons/*.svg")
		.pipe(rename({
			prefix: 'icon-'
		}))
		.pipe(cheerio({
			run: function ($, file) {
				$('[fill]').each(function (index, object) {
					if ($(object).attr('save-fill') === undefined) {
						$(object).removeAttr('fill');
					}
				});
				$('[style]').removeAttr('style');

				let filename = path.basename(file.relative, path.extname(file.relative));

				$('[clip-path]').each(function (index, object) {
					let newUrl = $(object).attr('clip-path').replace(/url\(#(.+)\)/g, 'url(#' + filename + '_$1)');

					$(object).attr('clip-path', newUrl);
				});

				$('[id]').each(function (index, object) {
					let newId = filename + "_" + $(object).attr('id');

					$(object).attr('id', newId);
				});
			},
			parserOptions: {
				xmlMode: true
			}
		}))
		.pipe(svgmin({
			cleanupIDs: {
				minify: true
			},
			js2svg: {
				pretty: true
			}
		}))
		.pipe(svgstore({
			inlineSvg: true,
			formatting: {
				indent_size: 10
			}
		}))
		.pipe(cheerio({
			run: function ($) {
				$('svg').attr({
					style: 'display: block !important; height: 0 !important; width: 0 !important;',
					width: '0',
					height: '0'
				});
			},
			parserOptions: {
				xmlMode: true
			}
		}))
		.pipe(replace(/(<svg[^>]+>)\s*/g, '$1\n'))
		.pipe(replace(/(<\/.*>)\s*(<symbol[^>]+>|<\/svg>)/g, '$1\n$2'))
		.pipe(dest('dist'))
		.on("end", browserSync.reload);
}

function svgCompile() {
	return src("dist/index.html")
		.pipe(cheerio({
			run: function ($, file) {
				let svgFile = "dist/icons.svg";
				if(fs.existsSync(svgFile)){
					$('body').prepend(fs.readFileSync(svgFile, "utf8"));
				}
			}
		}))
		.pipe(dest("dist"));
}

function deleteSvg() {
	return del("dist/icons.svg");
}

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'dist/'
		}
	});
}

function watching() {
	watch(['src/scss/**/*.scss'], styles);
	watch(['src/js/*.js'], scripts);
	watch(['src/js/libs/*/**'], copyLibsScripts);
	watch(['src/images/**/*'], images);
	watch(['src/icons/**/*.svg'], task("build-html"));
	watch(['src/**/*.pug']).on('change', task("build-html"));
}

task("build-html", series(svg, html, svgCompile, deleteSvg));
task("build", series("build-html", styles, scripts, copyLibsScripts, images));
exports.default = parallel("build", browsersync, watching);
