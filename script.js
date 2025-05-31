//Global Variables
const API_BASE_URL = 'http://localhost:3000';
let activePage = 1;
const limit = 10; //Number of students per page
let studentToDelete = null;

const regexValidationPatterns = {
    studentName: /^[A-Za-z'-\s]+$/,
    studentAge: /^(?:[1-9]|[1-9][0-9])$/,
    studentGrade: /^(?:[1-9]|1[0-2])$/
}

const allRegexValidationPatterns = {
    studentName: regexValidationPatterns.studentName,
    studentNameToEdit: regexValidationPatterns.studentName,
    studentAge: regexValidationPatterns.studentAge,
    studentAgeToEdit: regexValidationPatterns.studentAge,
    studentGrade: regexValidationPatterns.studentGrade,
    studentGradeToEdit: regexValidationPatterns.studentGrade
};

//Initialize settings
(function () {
    initializeEventListeners();
    fetchStudents(activePage);
})();


function validate(field, regex) {
    const id = field.id;
    const errorFieldName = `${id}Error`;
    const errorField = document.getElementById(errorFieldName);
    if (regex.test(field.value)) {
        field.className = 'form-control valid';
        errorField.classList.add('d-none');
    } else {
        field.className = 'form-control invalid';
        errorField.classList.remove('d-none');
    }
}


async function addStudent() {
    const studentName = document.getElementById('studentName').value;
    const studentAge = document.getElementById('studentAge').value;
    const studentGrade = document.getElementById('studentGrade').value;
    const studentData = { 'studentName': studentName, "studentAge": studentAge, 'studentGrade': studentGrade };

    console.log("studentData:", studentData);
    const url = `${API_BASE_URL}/student`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        // If response is not OK (e.g., 4xx or 5xx), throw an error
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        console.log("Data received:", result);
        resetAddNewStudentForm();
        // Show success toast
        showToastMessage("add-student-toast-success");
        fetchStudents(activePage);
    } catch (error) {
        console.error("Error:", error);
        // Show error toast
        showToastMessage("add-student-toast-failed");
    }

    bootstrap.Modal.getInstance(document.getElementById('addStudentModal')).hide();
}

function resetAddNewStudentForm() {
    const form = document.getElementById('addNewStudentForm');
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
    });
}

async function updateStudent() {
    const studentName = document.getElementById('studentNameToEdit').value;
    const studentAge = document.getElementById('studentAgeToEdit').value;
    const studentGrade = document.getElementById('studentGradeToEdit').value;
    const studentId = document.getElementById('targetListIdToEdit').value;
    const studentData = { id: studentId, name: studentName, age: studentAge, grade: studentGrade };

    console.log("studentData:", studentData);
    const url = `${API_BASE_URL}/student-update`;

    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(studentData)
        });

        // If response is not OK (e.g., 4xx or 5xx), throw an error
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        console.log("Data received:", result);

        // Show success toast
        showToastMessage("update-student-toast-success");
        fetchStudents(activePage);
    } catch (error) {
        console.error("Error:", error);

        // Show error toast
        showToastMessage("update-student-toast-failed");
    }

    bootstrap.Modal.getInstance(document.getElementById('editStudentModal')).hide();
}

async function deleteStudent() {

    const url = `${API_BASE_URL}/student-delete/${studentToDelete}`;
    console.log("Delete URL: ", url);

    try {
        const response = await fetch(url, {
            method: "DELETE"
        });

        // If response is not OK (e.g., 4xx or 5xx), throw an error
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        console.log("Data received:", result);

        const countRes = await fetch(`${API_BASE_URL}/students-count`);
        const { total } = await countRes.json();
        const totalPages = Math.ceil(total / limit);

        if (activePage > totalPages) {
            activePage = Math.max(1, totalPages);
        }

        fetchStudents(activePage); // Reload updated list
        // Show success toast
        showToastMessage("delete-student-toast-success");
    } catch (error) {
        console.error("Error:", error);
        // Show error toast
        showToastMessage("delete-student-toast-failed");
    }
}

function initializeFormSubmitEventListeners() {
    const addNewStudentForm = { purpose: 'addStudentInfo', formName: 'addNewStudentForm', nameField: 'studentName', ageField: 'studentAge', gradeField: 'studentGrade' };
    const editStudentForm = { purpose: 'editStudentInfo', formName: 'editStudentForm', nameField: 'studentNameToEdit', ageField: 'studentAgeToEdit', gradeField: 'studentGradeToEdit' };
    const allForms = [addNewStudentForm, editStudentForm];

    allForms.forEach((form) => {
        document.getElementById(form.formName).addEventListener('submit', function (e) {
            e.preventDefault(); // Always prevent default first

            let isValid = true;

            // Check each field against its pattern
            const nameField = document.getElementById(form.nameField);
            const ageField = document.getElementById(form.ageField);
            const gradeField = document.getElementById(form.gradeField);

            if (!allRegexValidationPatterns.studentName.test(nameField.value)) {
                validate(nameField, allRegexValidationPatterns.studentName);
                isValid = false;
            }
            else if (!allRegexValidationPatterns.studentAge.test(ageField.value)) {
                validate(ageField, allRegexValidationPatterns.studentAge);
                isValid = false;
            }
            else if (!allRegexValidationPatterns.studentGrade.test(gradeField.value)) {
                validate(gradeField, allRegexValidationPatterns.studentGrade);
                isValid = false;
            }

            // If all fields pass validation, allow submission logic to run
            if (isValid) {
                // Replace with your submission logic (e.g., AJAX, etc.)
                console.log('Form is valid, submitting...');
                switch (form.purpose) {
                    case 'addStudentInfo':
                        addStudent();
                        break;
                    case 'editStudentInfo':
                        updateStudent();
                        break;
                }
            } else {
                //Display a popup modal
                //"Sorry, but the form can not be submitted until you fix the errors first."
                // "Fix Form Errors modal popup
                new bootstrap.Modal(document.getElementById('fixFormErrorsModal')).show();
                console.log('Form is invalid, fix errors before submitting.');
            }
        });
    })

} // END initializeFormSubmitEventListeners

function renderStudentTable(students) {
    const tbody = document.querySelector('#student-table tbody');
    tbody.innerHTML = '';
    if (!students) return;

    students.forEach(s => {
        const deleteButton = `<button class="p-0 border-0 delete-btn" data-id="${s.id}"><i class="fa fa-trash" aria-hidden="true"></i></button>`;
        const editButton = `<button class="p-0 border-0 edit-btn" data-id="${s.id}" style="border: none; background: none;" > <i class="fa-solid fa-pen-to-square"></i></button > `;
        tbody.innerHTML += `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.age}</td><td>${s.grade}</td><td>${editButton}</td><td>${deleteButton}</tr>`;
    });
}


function renderPagination(totalItems, currentPage, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    if (totalItems === 0) return;

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page - item ${currentPage === 1 ? 'disabled' : ''} `;
    prevLi.innerHTML = `<a class="page-link" href = "#" tabindex = "-1"> Previous</a>`;
    prevLi.onclick = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            fetchStudents(currentPage - 1);
            activePage = currentPage - 1;
        }
    };
    pagination.appendChild(prevLi);

    // Numbered pages
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page - item ${i === currentPage ? 'active' : ''} `;
        li.innerHTML = `<a class="page-link" href = "#"> ${i}</a> `;
        li.onclick = (e) => {
            e.preventDefault();
            fetchStudents(i);
            activePage = i;
        };
        pagination.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page - item ${currentPage === totalPages ? 'disabled' : ''} `;
    nextLi.innerHTML = `<a class="page-link" href = "#"> Next</a> `;
    nextLi.onclick = (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            fetchStudents(currentPage + 1);
            activePage = currentPage + 1;
        }
    };
    pagination.appendChild(nextLi);
}

function fetchStudents(page) {

    const url = `${API_BASE_URL}/students-list?page=${page}&limit=${limit}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.total > 0) {
                displayNoStudentsFoundMessage('');
                renderStudentTable(data.students);
                const maxPages = Math.ceil(data.total / limit);
                page = (page > maxPages) ? maxPages : page;
                renderPagination(data.total, page, limit);
            }
            else { //There are no students in the database, display an appropriate message                
                const errorMessage = `
                    <div class="alert alert-danger text-center w-100" role="alert">
                        No students found!
                    </div>
                `;
                displayNoStudentsFoundMessage(errorMessage);
                renderStudentTable(null);
                renderPagination(data.total, page, limit);
            }
        });
}



// Get student data from the database given an id
async function fetchStudentData(studentIDToUpdate) {
    try {
        const response = await fetch(`${API_BASE_URL}/student-get/${studentIDToUpdate}`);
        const data = await response.json();

        if (data && data.studentData) {
            return {
                name: data.studentData.name,
                age: data.studentData.age,
                grade: data.studentData.grade
            };
        } else {
            displayNoStudentsFoundMessage(`
                <div class="alert alert-danger text-center w-50" role="alert">
                    Student not Found!
                </div>
            `);
            return null;
        }
    } catch (err) {
        console.error("Failed to fetch student data:", err);
        return null;
    }
}

function initializeEventListeners() {

    initializeFormSubmitEventListeners();

    //For form validation
    const inputs = document.querySelectorAll('input');

    //Handle validiation based on field type
    inputs.forEach((input) => {
        input.addEventListener('keyup', (e) => {
            console.log('Performing validation on ', e.target.attributes.id);
            const regexPattern = allRegexValidationPatterns[e.target.attributes.id.value];
            validate(e.target, regexPattern);
        });
    });


    // "About" (this website) modal popup
    document.getElementById('siteInfoBtn').addEventListener('click', function () {
        new bootstrap.Modal(document.getElementById('siteInfoModal')).show();
    });

    // Display confirm delete modal popup
    document.getElementById('student-table').addEventListener('click', function (event) {
        const button = event.target.closest('.delete-btn');
        if (button) {
            studentToDelete = button.getAttribute('data-id');
            new bootstrap.Modal(document.getElementById('confirmDeleteModal')).show();
        }
    });

    // Handle confirm delete student
    document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
        if (studentToDelete) {
            deleteStudent();
            studentToDelete = null;
        }
        bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
    });


    // Display update student form modal popup
    document.getElementById('student-table').addEventListener('click', async function (event) {
        const button = event.target.closest('.edit-btn');
        if (button) {
            const studentIDToUpdate = button.getAttribute('data-id');

            //Fetch student data
            const studentData = await fetchStudentData(studentIDToUpdate);
            if (studentData) {
                const { name, age, grade } = studentData;
                document.getElementById('studentNameToEdit').value = name;
                document.getElementById('studentAgeToEdit').value = age;
                document.getElementById('studentGradeToEdit').value = grade;
                document.getElementById('targetListIdToEdit').value = studentIDToUpdate;
                resetUpdateFormState(document.getElementById('editStudentForm'));
                new bootstrap.Modal(document.getElementById('editStudentModal')).show();
            }

        }
    });

} //END - initializeEventListeners

function resetUpdateFormState(form) {

    // remove validation classes
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
    });

    // Hide all error <small> messages
    const errorMessages = form.querySelectorAll('small.text-danger');
    errorMessages.forEach(small => {
        small.classList.add('d-none');
    });
};

function displayNoStudentsFoundMessage(msg) {
    const errorMessageContainer = document.getElementById('no-students-found-message');
    errorMessageContainer.innerHTML = msg;
}

function showToastMessage(toastId) {
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}