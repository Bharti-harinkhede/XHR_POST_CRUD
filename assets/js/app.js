
const cl = console.log

const postContainer = document.getElementById("postContainer")
const postForm = document.getElementById("postForm")
const titleCntrl = document.getElementById("title")
const contentCntrl = document.getElementById("content")
const userIdCntrl = document.getElementById("userId")
const addPostBtn = document.getElementById("addPostBtn")
const updatePostBtn = document.getElementById("updatePostBtn")
const loader = document.getElementById("loader")

let BASE_URL = `https://jsonplaceholder.typicode.com`
let POST_URL = `${BASE_URL}/Posts`;

function snackBar(title, icon){
    Swal.fire({
        title,
        icon,
        timer: 1000
    })
}

const createCards = arr =>{
    let res = arr.map(post=>{
        return `
        <div class="card mb-3 shadow rounded" id="${post.id}">
                    <div class="card-header">
                        <h3 class="m-0">${post.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">
                        ${post.body}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                    </div>
                </div> `;
    }).join("")
    cl(res)
    postContainer.innerHTML = res;
}

function fetchAllPosts(){
    loader.classList.remove("d-none")
    let xhr = new XMLHttpRequest() //create instance of XMLHttpRequest
    xhr.open("GET", POST_URL) //configuration by using open method
    xhr.setRequestHeader("Auth", "Token from LS")

    xhr.onload = function(){
        cl(xhr.readyState)
        if(xhr.status >= 200 && xhr.status < 300 &&xhr.readyState === 4){
            let data = JSON.parse(xhr.response)
            createCards(data)
            //templating
        }else{
             snackBar(`somthing went wrong !!!`, 'error')
        }
         loader.classList.add("d-none")
    }
    //send request to backend
    xhr.send(null)
}
fetchAllPosts()


function onPostSubmit (eve){
    eve.preventDefault()
 //get new post_object
    let postObj = {
        title : titleCntrl.value,
        body : contentCntrl.value,
        useId : userIdCntrl.value
    }
    cl(postObj)
    eve.target.reset()
    //API call to post (method send) object
    //create xht instance

     loader.classList.remove('d-none')
    let xhr = new XMLHttpRequest()

    //open method configuration
    xhr.open("POST", POST_URL)
    xhr.onload = function(){
        //api call
        if(xhr.status >= 200 && xhr.status < 300 ){ //api call success
          let res = JSON.parse(xhr.response)
          cl(res)

          //create new card on ui
          let card = document.createElement("div");
          card.className =`card mb-3 shadow rounded`;
          card.id = res.id;
          card.innerHTML = `
          <div class="card-header">
                        <h3 class="m-0">${postObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">
                        ${postObj.body}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                    </div> `;
                    postContainer.append(card)
                    snackBar(`new post creates successfully!!`, "success")
        }else{
            //api call fail
            let err = `something went wrong ehile creating post`
        }
        loader.classList.add('d-none');
    }
    //send body
    xhr.send(JSON.stringify(postObj))
}


function onRemove(ele) {
    Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then(result => {
  cl (result.isConfirmed) 

    loader.classList.remove('d-none');
    let REMOVE_ID = ele.closest('.card').id;
    let REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}`;

    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", REMOVE_URL);

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            snackBar(`The post with id ${REMOVE_ID} is removed successfully!`, 'success');
            ele.closest('.card').remove();
        } else {
            snackBar(`Something went wrong !!!`, 'error');
        }
        loader.classList.add('d-none');
    }
    xhr.send(null);
  }
)
}

function onEdit(ele) {

    loader.classList.remove('d-none');
    let EDIT_ID = ele.closest('.card').id;

    localStorage.setItem('EDIT_ID', EDIT_ID);
    let EDIT_URL = `${POST_URL}/${EDIT_ID}`;

    postForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    setTimeout(() => {
        titleCntrl.focus();
    }, 400); 


    let xhr = new XMLHttpRequest();
    xhr.open("GET", EDIT_URL);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            let res = JSON.parse(xhr.response);
            titleCntrl.value = res.title;
            contentCntrl.value = res.body;
            userIdCntrl.value = res.userId;

            updatePostBtn.classList.remove("d-none");
            addPostBtn.classList.add("d-none");
        } else {
            snackBar(`Something went wrong`, 'error');
        }
        loader.classList.add('d-none');
    }
    xhr.send(null);
}

function onPostUpdate() {

    loader.classList.remove('d-none');
    let UPDATED_ID = localStorage.getItem('EDIT_ID');
    let UPDATED_URL = `${POST_URL}/${UPDATED_ID}`;

    let UPDATED_OBJ = {
        title: titleCntrl.value,
        body: contentCntrl.value,
        userId: userIdCntrl.value,
        id: UPDATED_ID
    };
    let xhr = new XMLHttpRequest();
    xhr.open("PATCH", UPDATED_URL);

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            let res = JSON.parse(xhr.response);
            // update UI
            let card = document.getElementById(UPDATED_ID);
            card.querySelector(".card-header h3").innerText = UPDATED_OBJ.title;
            card.querySelector(".card-body p").innerText = UPDATED_OBJ.body;
          
            card.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            card.classList.add("border", "border-success");
            setTimeout(() => {
                card.classList.remove("border", "border-success");
            }, 1200);

            postForm.reset();
            updatePostBtn.classList.add("d-none");
            addPostBtn.classList.remove("d-none");
            snackBar(`Post ID ${UPDATED_ID} updated successfully`, "success");
        } else {
            snackBar(`Something went wrong while updating`, "error");
        }
        loader.classList.add('d-none');
    };
    xhr.send(JSON.stringify(UPDATED_OBJ));
}


updatePostBtn.addEventListener("click", onPostUpdate)
postForm.addEventListener("submit", onPostSubmit)