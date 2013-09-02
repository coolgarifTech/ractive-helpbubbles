.PHONY: js
js:
	@mkdir --parents $(dir js/helpbubbles.min.js)
	@echo "Creating & compressing js/helpbubbles.min.js... \t\t\c"
	@uglifyjs js/helpbubbles.js --comments --output js/helpbubbles.min.js
	@echo "[ Done ]"
