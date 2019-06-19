document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav');
    const firstImage = document.querySelector('.one');
    const filterResults = document.querySelector('.filter-results');
    const reportForm = document.querySelector(".report-form");
    
    document.querySelector('#nav-toggle').onclick = () => {
        if(nav.className === "nav") {
            nav.className += " responsive";
            firstImage.className += " responsive";
            filterResults.className += " responsive";
            reportForm.className +=  " show" + " responsive";
        }   else {
                nav.className = "nav";
                firstImage.className = "one";
                filterResults.className = "filter-results";
                reportForm.className += ".report-form.show";
            }
    }

    const arrowUp = document.querySelector('.arrow-up');
    const dropDown = document.querySelector('.dropdown');
    const body = document.querySelector('.body');
    
    document.querySelector('.img-svg').onclick = () => {
        if(arrowUp.style.display == 'none' && dropDown.style.display == 'none') {
            arrowUp.style.display = 'block';
            dropDown.style.display = 'block';
        } else {
            dropDown.style.display = 'none';
            arrowUp.style.display = 'none';
        }
    }

    // const sectionResult = document.querySelector(".section-result");
    // const reportsAds = document.querySelectorAll(".report");
    
    // for(let i=0; i < reportsAds.length; i++) {
    //     reportsAds[i].onclick = () => {
    //         nav.style.pointerEvents = "none";
    //         if(reportForm.className === "report-form") {
    //             reportForm.className += " show";
    //             sectionResult.className += " show";
    //         } else {
    //             reportForm.className = "report-form";
    //             sectionResult.className = "section-result";
    //         }
    //     }        
    // }
    
    // document.querySelector(".report-close").onclick = () => {
    //     reportForm.className = "report-form";
    //     sectionResult.className = "section-result"
    // }
})