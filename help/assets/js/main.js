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