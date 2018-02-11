import cltk.corpus.latin
from cltk.stem.latin.j_v import JVReplacer
jv_replacer = JVReplacer()

def clean_text(text):
    return jv_replacer.replace(text).lower()

def get_corpus_files(author):
    fileids = filter(lambda s: s.startswith(author), cltk.corpus.latin.latinlibrary.fileids())
    files = [cltk.corpus.latin.latinlibrary.abspath(fileid) for fileid in fileids]
    return files

def merge_file_contents(paths):
    text = ''
    for path in paths:
        f = open(path)
        text += f.read()
        #print('loaded', path, 'buffer length', len(text))
        f.close()
    return clean_text(text)

def load_corpora(authors):
    files = []
    for author in authors:
        files.extend(get_corpus_files(author))
    return merge_file_contents(files)
