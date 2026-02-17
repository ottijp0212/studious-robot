"""キャッシュ無効化付きHTTPサーバー"""
import http.server
import os

os.chdir('/home/otti0212/recipe-app')

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    # Service Worker と manifest のMIMEタイプを明示
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.webmanifest': 'application/manifest+json',
    }

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

print('サーバー起動: http://localhost:8080')
http.server.HTTPServer(('', 8080), NoCacheHandler).serve_forever()
