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

const toggler = document.getElementsByClassName('caret');
for (let i = 0; i < toggler.length; i++) {
    toggler[i].addEventListener('click', function() {
        this.parentElement
            .querySelector('.nested-treeview')
            .classList.toggle('active-treeview');
        this.classList.toggle('caret-down');
    });
}

const articles = {};
function parseName(name) {
    return name.replace('.md', '').replace('-', '');
}

const ulMainNavTree = document.getElementById('main-navigation-tree');

const articlePages = window.pages
    .filter(page => page.dir.includes('/articles/'))
    .map(page => Object.assign(page, { pathArray: page.path.split('/') }))

articlePages.forEach(page => {
    let lastContainer = ulMainNavTree;
    let currentPath = '';
    page.pathArray.forEach(path => {
        currentPath += path + '-';
        let li = document.getElementById(currentPath+'li');
        if (!li) {
            li = document.createElement("LI");
            li.setAttribute("id", currentPath+'li');
            li.appendChild(document.createTextNode(path));
            lastContainer.appendChild(li);
        }

        if (!path.includes('.md')) {
            if (document.getElementById(currentPath+'ul')) {
                lastContainer = document.getElementById(currentPath+'ul');
            } else {
                const newContainer = document.createElement("UL");
                newContainer.setAttribute("id", currentPath+'ul');
                li.appendChild(newContainer);
                lastContainer = newContainer;
            }
        }
    });
});

console.log(articlePages);
console.log(articles);