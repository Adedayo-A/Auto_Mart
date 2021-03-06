document.addEventListener('DOMContentLoaded', () => {
    const arrowUp = document.querySelector('.arrow-up');
    const dropDown = document.querySelector('.dropdown');
    const body = document.querySelector('.body');
    const inStore = JSON.parse(localStorage.getItem('loggedInUser'));

    // VERIFY LOCAL STORAGE
    if (!inStore) {
        const needUser = document.querySelector('.need-user');
            needUser.style.display = 'none';
        const needUserLink = document.querySelectorAll('.need-user-link');
        needUserLink.forEach((noUserLink) => {
            noUserLink.href = 'signinpage.html';
        });
    } else if (inStore) {
        const inStore = JSON.parse(localStorage.getItem('loggedInUser'));
        console.log(inStore);
        let firstname = inStore.data.username;
        const neednotUser = document.querySelectorAll('.no-user');
        neednotUser.forEach((neednouser)=> {
            neednouser.style.display = 'none';
        })
        document.querySelector('.dashboard-dropdown').innerHTML = `Welcome ${firstname}`
    }

    // VERIFY TOKEN 
    const token_verify = () => {
        const path = '/api/v1/users/auth/tokenverify';
        const inStore = JSON.parse(localStorage.getItem('loggedInUser'));
        console.log(inStore);
        if (inStore === null) {
            console.log('token expired');
            toastr.info('session expired, please login');
            localStorage.clear();
            window.location.href = 'signinpage.html';
        } else {
            const { token } = inStore.data;
            const data = {
                token,
            }
            httpPost(path, data, (err, respData, xhttp) => {
                console.log(respData);
                if (err) {
                    console.log(err);
                }  else if(respData.status === 200) {
                        console.log('still on');
                }  else if(respData.status === 401) {
                    toastr.info('session expired');
                    localStorage.clear();
                    window.location.href = "signinpage.html";
                }
            });
        }
    }
    token_verify();

    // SIGN OUT
    document.querySelector('.sign-out').onclick = () => {
        localStorage.clear();
        window.location.href = 'signinpage.html';
    }

    
    // CLICK USER SVG
    document.querySelector('.img-svg').onclick = () => {
        if(arrowUp.style.display == 'none' && dropDown.style.display == 'none') {
            arrowUp.style.display = 'block';
            dropDown.style.display = 'block';
        } else {
            dropDown.style.display = 'none';
            arrowUp.style.display = 'none';
        }
    }

    // NAV TOGGLE CLICK ON MOBILE
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

    // GET A SPECIFIC CAR ORDER
    const getaCarOrder = () => {
        const postId = window.location.search.slice(1).split("&")[0].split("=")[1];
        console.log(postId);
        path = `/api/v1/cars/${postId}/carorders/`;
        httpGet(path, (err, response, xhttp) => {
            if (err) {
                toastr.error('An error occured');
                console.log(err);
            } else if (response.status === 401) {
                toastr.info('session expired');
                window.location.href = "signinpage.html";
            } else if (response.status === 200) {
                // toastr.info(response.data.message);
                const orderdetails = response.data.car_ord;
                let output = '';
                    const accept = '<button class="accept" value="accepted"> Accept </button>'
                    const reject = '<button class="reject" value="reject"> Reject </button>'
                    const image = orderdetails.image || 'N/A';
                    const carId = orderdetails.car_id || 'N/A';
                    const manufacturer = orderdetails.manufacturer || 'N/A';
                    const model = orderdetails.model || 'N/A';
                    const isaccepted = orderdetails.status == 'accepted';
                    const priceOffered = orderdetails.amount || 'N/A';
                    const orderId = orderdetails.id || 'N/A';
                    output += `<div class="div-result-wrap wrap-all">
                        <div class="wrapper-result one">
                            <div class="card-pictures">
                                    <img src= ${image} />
                            </div>
                            <div class="card-stories">
                                <div class="div-inside-card">
                                    <h4 class="first-heading-card-stories"> Car id: ${carId} </h4>
                                    <h4 class="first-heading-card-stories"> Manufacturer: ${manufacturer} </h4>
                                    <h4 class="first-heading-card-stories"> Model: ${model} </h4>
                                    <h4 class="first-heading-card-stories"> Status of Order: ${orderdetails.status} </h4>
                                    <h3 class="heading-price-card-stories"> Price Offered: ${priceOffered} </h3>
                                </div>
                            </div>
                            <p class="para-delete-card-stories">
                                ${!isaccepted ? accept:''}
                                ${!isaccepted ? reject:''}
                                </p>
                        </div>
                    </div>`
                document.querySelector('.section-result').innerHTML = output;
                
                const statusAccept = () => {
                    console.log('here');
                    const adId = window.location.search.slice(1).split("&")[0].split("=")[1];
                    console.log(adId);
                    const path = `/api/v1/cars/${adId}/carorders`;  // '/api/v1/car/:id/carorders
                    const status = document.querySelector('.accept').value;
                    const data = {
                        status,
                    }

                    httpPatch( path, data, (err, response, xhttp) => {
                        console.log(response);
                        if (err) {
                            toastr.error('An error occured');
                            console.log(err);
                        } else {
                            // window.location.href = 'mycarorders.html';
                            toastr.success(response.data.message);
                        }
                    });
                }
                const statusReject = () => {
                    console.log('here');
                    const adId = window.location.search.slice(1).split("&")[0].split("=")[1];
                    console.log(adId);
                    const path = `/api/v1/cars/${adId}/carorders`;       
                    const status = document.querySelector('.reject').value;
                    const data = {
                        status
                    }

                    httpPatch( path, data, (err, response, xhttp) => {
                        if (err) {
                            toastr.error('An error occured');
                            console.log(err);
                        } else {
                            toastr.success(response.data.message);
                            // window.location.href = 'mycarorders.html';
                        }
                    });
                }

                document.querySelector('.accept').onclick =  statusAccept;
            
                document.querySelector('.reject').onclick = statusReject;
                
            } else {
                console.log(response);
                // toastr.info(response.message);
            }
        });
    }
    getaCarOrder(); 
});
