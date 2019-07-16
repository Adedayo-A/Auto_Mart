document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav');
    const mainIndex = document.querySelector('.main-index');
    const inStore = JSON.parse(localStorage.getItem('loggedInUser'));

    // VERIFY LOCAL STORAGE
    if (!inStore) {
        const needUser = document.querySelector('.need-user');
            needUser.style.display = 'none';
        const needUserLink = document.querySelectorAll('.need-user-link');
        needUserLink.forEach((noUserLink) => {
            noUserLink.href = 'UI/signinpage.html';
        });
    } else if (inStore) {
        const inStore = JSON.parse(localStorage.getItem('loggedInUser'));
        console.log(inStore);
        let firstname = inStore.username;
        const neednotUser = document.querySelectorAll('.no-user');
        neednotUser.forEach((neednouser)=> {
            neednouser.style.display = 'none';
        })
        document.querySelector('.dashboard-dropdown').innerHTML = `Welcome ${firstname}`
    }

    // VERIFY TOKEN 
    const tokenVerify = () => {
        const path = '/api/v1/users/auth/tokenverify';
        const inStore = JSON.parse(localStorage.getItem('loggedInUser'));
        console.log(inStore);
        if (inStore === null) {
            console.log('token expired');
            toastr.info('session expired, please login');
            localStorage.clear();
            window.location.href = 'UI/signinpage.html';
        } else {
            const token = inStore.token;
            const data = {
                token: token,
            }
            httpPost(path, data, (err, respData, xhttp) => {
                console.log(respData);
                if (err) {
                    console.log(err);
                }  else if (respData.status === 200) {
                        console.log('still on');
                }  else if (respData.status === 403) {
                    toastr.info('session expired');
                    localStorage.clear();
                    window.location.href = "UI/signinpage.html";
                }
            });
        }
    }
    tokenVerify();

    // SIGN OUT
    document.querySelector('.sign-out').onclick = () => {
        localStorage.clear();
        window.location.href = 'UI/signinpage.html';
    }

    // VERIFY NAVBAR ON MOBILE
    document.querySelector('#nav-toggle').onclick = () => {
        if(nav.className === "nav") {
            nav.className += " responsive";
            mainIndex.className += " responsive";

        }   else {
                nav.className = "nav";
                mainIndex.className = "main-index";
        }
    }

    // ICON CLICK
    const arrowUp = document.querySelector('.arrow-up');
    const dropDown = document.querySelector('.dropdown');
    const body = document.querySelector('.body');
    
    document.querySelector('.img-svg').onclick = () => {
        if(arrowUp.style.display === 'none' && dropDown.style.display == 'none') {
            arrowUp.style.display = 'block';
            dropDown.style.display = 'block';
        } else {
            dropDown.style.display = 'none';
            arrowUp.style.display = 'none';
        }
    }

    // LINK TO POST CAR AD
    document.querySelector('.post-car').onclick = () => {
        const path = '/api/v1/users/auth/getuser';
        httpGet(path, (err, respData, xhttp) => {
            if (err) {
                console.log(err);
            } else if (respData.first_name === null || respData.last_name === null || respData.address === null) {
                console.log(respData);
                toastr.info('Please complete your profile in order to post your car!!');
                window.location.href = "./UI/updateuser.html"
            } else {
                window.location.href = "./UI/sell.html"
            }
        })
    }

    // ADMIN VIEW SOLD CARS
    if (!inStore.admin) {
        document.querySelector('.sold').style.display = 'none';
    } else {
        document.querySelector('.sold').style.display = 'block';
    }

    // GET CARS
    document.querySelector('.form-search').onsubmit = (e) => {
        e.preventDefault();
        console.log('I was hit');
        const description = document.querySelector('.input-section-search');
        const manufacturer = document.querySelector('.select-sub-search-make');
        const status = document.querySelector('.select-sub-search-availability');
        const state = document.querySelector('.select-sub-search-usage');
        const min_price = document.querySelector('.search-price-min');
        const max_price = document.querySelector('.search-price-max');

        const query = `?description=${description.value}&manufacturer=${manufacturer.value}&status=${status.value}&state=${state.value}&min_price=${min_price.value}&max_price=${max_price.value}`;
        const path = `/api/v1/car/${query}`;
        console.log(path);
        httpGet(path, (err, response, xhttp) => {
            if (err) {
                toastr.error('An error occured');
                console.log(err);
            } else if (response.status === 401) {
                window.location.href = 'UI/signinpage.html';
                toastr.info('session expired');
            } else if (response.state === 'success') {
                document.querySelector('.section-search').style.display = 'none';
                const result = document.querySelector('.section-result')
                console.log(response);
                toastr.info(response.message);
                const cars = response.carad;
                let output = '';
                for (var i in cars) {
                    const carId = cars[i].id || 'N/A';
                    const delButton = `<button class="delete" value="${carId}"> Delete AD </button>`;
                    output += `<div class="div-result-wrap wrap-all">
                        <div class="wrapper-result one">
                            <div class="card-pictures"> 
                                <a href=UI/an_ad.html?car_id=${cars[i].id} />
                                    <img src= ${cars[i].image_url} />
                                </a>
                            </div>
                            <div class="card-stories">
                                <div class="div-inside-card">
                                    <h4 class="first-heading-card-stories"> ${cars[i].state} </h4>
                                    <h3 class="heading-price-card-stories"> ${cars[i].price} </h3>
                                    <h4 class="heading-make-card-stories"> ${cars[i].manufacturer} </h4>
                                    <p class="para-status-card-stories">
                                        <span>${cars[i].status}</span>
                                    </p>
                                    <p class="para-delete-card-stories">
                                        <a href="purchase-order.html?adId=${carId}">
                                            <button class="edit"> Make a purchase order</button>
                                        </a>
                                        <a href="UI/flag.html?adId=${carId}">
                                            <button class="edit">Flag</button>
                                        </a>
                                        ${inStore.admin ? delButton: ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>`  
                }
                const deleteAd = (e) => {
                    const targ = e.target.value;
                    console.log(targ);
                    path = `/api/v1/car/${targ}/`;
                    httpDelete( path, (err, response, xhttp) => {
                        if (err) {
                            toastr.error('An error occured');
                            console.log(err);
                        } else {
                            console.log(response);
                            toastr.success(response.message)
                        }
                    })
                }
                
                document.querySelector('.section-result').innerHTML = output;
                if (inStore.admin) {
                    document.querySelector('.delete').onclick = deleteAd;
                }
                document.querySelector('.second-background-image').style.display = 'none';
                result.scrollIntoView();
            } else {
                console.log(response);
                toastr.info(response.message);
            }
        })
    }
});



// localStorage.setItem('output', JSON.stringify(output));
/// const outstore = JSON.parse(localStorage.getItem('output'));
// const output = '';
//                 for (var i in carad) {
//                     output +=    
//                     '<section class="section-result">' +
//                         '<div class="filter-results">' +
//                             '<h3>Filter Search</h3>' +
//                             '<input type="checkbox" name="usage-of-cars" checked /> All <br>' +
//                             '<input type="checkbox" name="usage-of-cars" /> Used Cars <br>' +
//                             '<input type="checkbox" name="usage-of-cars" /> New Cars <br>' +
//                         '</div>' +
//                         '<div class="div-result-wrap wrap-all">' +
//                             '<div class="wrapper-result one">' +
//                                 '<div class="card-pictures"></div>' +
//                                 '<div class="card-stories">' +
//                                     '<div class="div-inside-card">' +
//                                         '<h4 class="first-heading-card-stories">' + carad[i].state +'</h4>' +
//                                         '<h3 class="heading-price-card-stories">' + carad[i].price +' </h3>' +
//                                         '<h4 class="heading-make-card-stories">' + carad[i].manufacturer +'</h4>' +
//                                         '<p class="para-status-card-stories">' +
//                                             '<span>' + carad[i].status +'</span>' +
//                                         '</p>' +
//                                     '</div>' +
//                                 '</div>' +
//                             '</div>' +
//                         '</div>' +
//                     '</section>'

// var output = '';
//           for(var i in users){
//             output +=
//               '<div class="user">' +
//               '<img src="'+users[i].avatar_url+'" width="70" height="70">' +
//               '<ul>' +
//               '<li>ID: '+users[i].id+'</li>' +
//               '<li>Login: '+users[i].login+'</li>' +
//               '</ul>' +
//               '</div>';
//           }

// userBlogWrapper.innerHTML += <a href="Bloglist/post.html?id={post.id}>
// <h2 class="post-title">
//   post.title}
// </h2>
// </a>
// <p class="post-meta">Posted by
// <a href="Bloglist/post.html">post.author}</a>
// on May 30, 2019</p>`
// })

// var output = '';

// output += '<ul>' +
//   '<li>ID: '+user.id+'</li>' +
//   '<li>Name: '+user.name+'</li>' +
//   '<li>Email: '+user.email+'</li>' +
//   '</ul>';

// document.getElementById('user').innerHTML = output

// var output = '';
//           for(var i in users){
//             output +=
//               '<div class="user">' +
//               '<img src="'+users[i].avatar_url+'" width="70" height="70">' +
//               '<ul>' +
//               '<li>ID: '+users[i].id+'</li>' +
//               '<li>Login: '+users[i].login+'</li>' +
//               '</ul>' +
//               '</div>';
//           }
