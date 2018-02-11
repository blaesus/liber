import sys
from multiprocessing import Pool
from cltk.tag.pos import POSTag
from corpus_util import load_corpora

tagger = POSTag('latin')

tagFn = tagger.tag_crf

POS_OUTPUT_ROOT = './pos/'

authors = sys.argv[1:] or ['caesar', 'ovid', 'jerome', 'bacon', 'kepler']

def print_progress(author, progress, total):
    if (progress % 100 == 0):
        message = author + ':' + str(progress) + '/' + str(total)
        print(message)

def tag_corpora(author):
    corpora = load_corpora(author)
    print('loaded data for', author)
    f = open(POS_OUTPUT_ROOT+author+'-tag'+'.txt', 'a')
    sentences = corpora.split('.')
    i = 0
    for sentence in sentences:
        print_progress(author, i, len(sentences))
        tags = tagFn(sentence.replace(',', '')
        for tag in tags:
            f.write('|'.join(tag)+'\n')
        i += 1
    print('done')
    f.close()


pool = Pool(len(authors))
pool.map(tag_corpora, authors)
pool.close()
pool.join()
