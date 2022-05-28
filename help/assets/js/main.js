if (tocbot) {
    tocbot.init({
        // Where to render the table of contents.
        tocSelector: '.article-toc',
        // Where to grab the headings to build the table of contents.
        contentSelector: '.article-toc-content',
        // Disable the collapsible functionality of the library by
        // setting the maximum number of heading levels (6)
        collapseDepth: 6,
    });
}


const articles = {};

function parseName(name) {
    return name.replace(/\d{1}-/g, '').replace('.md', '').replaceAll('-', ' ');
}


const articlePages = window.pages
    .filter(page => page.dir.includes('/articles/'))
    .map(page => Object.assign(page, { pathArray: page.path.split('/') }))

articlePages.forEach(page => {
    let lastContainer = articles;
    page.pathArray.forEach(path => {
        lastContainer = lastContainer[path] = lastContainer[path] || {};
    })
});

function appendArticle(currentPath, content, htmlElement, level) {
    Object.keys(content).sort().forEach(path => {
        currentPath += path + '-';

        // Append a LI element with text (could be either a folder or a file)
        let li = document.getElementById(currentPath+'li');
        if (!li) {
            li = document.createElement('li');
            li.setAttribute("id", currentPath+'li');
            const span = document.createElement('span');
            span.appendChild(document.createTextNode(parseName(path)));
            if (level === 0) {
                span.setAttribute('class', 'caret');
            }
            li.appendChild(span);
            htmlElement.appendChild(li);
        }

        // Files are the leaf nodes of the content
        if (path.includes('.md')) {
            return;
        }

        // Create a UL element for folders if it doesn't exist
        let ul = document.getElementById(currentPath+'ul');
        if (!ul) {
            ul = document.createElement('ul');
            ul.setAttribute('id', currentPath+'ul');
            if (level === 0) {
                ul.setAttribute('class', 'nested-treeview');
            }
            li.appendChild(ul);
        }

        // Iterate the folder content
        appendArticle(currentPath, content[path], ul, level+1);
    });
}

appendArticle('', articles['articles'], document.getElementById('main-navigation-tree'), 0);

console.log(articlePages);
console.log(articles);

const toggler = document.getElementsByClassName('caret');
for (let i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener('click', function() {
        this.parentElement
            .querySelector('.nested-treeview')
            .classList.toggle('active-treeview');
        this.classList.toggle('caret-down');
    });
}
