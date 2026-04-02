.PHONY: push publish serve

push:
	git add .
	git commit -m "local changes"
	git push

publish:
	ssh jholfeld@alnilam.uberspace.de 'cd /var/www/virtual/jholfeld/ws.jholfeld.uber.space/ && git pull && exit'

serve: push publish
