SRC = $(wildcard src/*.js)
TAR = $(SRC:src%=dist%)

.PHONY: all clean

all: $(TAR)

dist/%.js: src/%.js
	(printf 'javascript:'; ./scratchpad/node_modules/terser/bin/uglifyjs $<) > $@

clean:
	rm -f $(TAR)

