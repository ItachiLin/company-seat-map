$(document).ready(function () {
    let isSeatEditMode = false;
    $('#edit-seat-button').on('click', function () {
        isSeatEditMode = !isSeatEditMode;
        console.log(isSeatEditMode);

    });

    $('#add-seat-button').on('click', function () {
        if (isSeatEditMode === false) {
            return;
        }
        console.log('準備新增座位');
        $('#floor-plan').append($('<div class="seat">').append('<div class="seat-employee-info">').css({ left: '50px', top: '290px' }));

    });

    let allEmployeeData = { name: '', department: '', role: '', extension: '' }


    $('#add-employee-button').on('click', function () {
        console.log($('#add-employee-name').val().trim());
        console.log($('#add-employee-department').val().trim());
        console.log($('#add-employee-role').val().trim());
        console.log($('#add-employee-extension').val().trim());
        const addEmployeeName = $('#add-employee-name').val().trim();
        const addEmployeeDepartment = $('#add-employee-department').val().trim();
        const addEmployeeRole = $('#add-employee-role').val().trim();
        const addEmployeeExtension = $('#add-employee-extension').val().trim();

        if (addEmployeeName === '' || addEmployeeDepartment === '' || addEmployeeRole === '') {
            alert('請輸入完整的員工資料');
            return;
        } else {
            const newEmployee = $('<li class="employee-item" draggable="true">');
            newEmployee.append($('<span class="employee-name">').text(addEmployeeName));
            newEmployee.append($('<span class="employee-department">').text(addEmployeeDepartment));
            newEmployee.append($('<span class="employee-role">').text(addEmployeeRole));
            if(addEmployeeExtension!==''){
                newEmployee.append($('<span class="employee-extension">').text('分機：' + addEmployeeExtension));
            }
            $('#employee-list').append(newEmployee);
        }
    })


    let isDraggingSeat = false;
    let selectedSeat = null;
    let mouseOffsetX = 0;
    let mouseOffsetY = 0;

    $('#floor-plan').on('mousedown', '.seat', function (event) {
        if (isSeatEditMode === false) {
            return;
        }
        event.preventDefault();
        console.log('開始移動座位');
        isDraggingSeat = true;
        selectedSeat = $(this);
        mouseOffsetX = event.pageX - selectedSeat.offset().left;
        mouseOffsetY = event.pageY - selectedSeat.offset().top;
        console.log($(this).offset().left);
        console.log($(this).offset().top);
        console.log($(this));
        console.log(event.pageX);
        console.log(event.pageY);
    });

    $(document).on('mousemove', function (event) {
        if (isDraggingSeat === false) {
            return;
        }

        selectedSeat.css({ left: `${event.pageX - $('#floor-plan').offset().left - mouseOffsetX}px`, top: `${event.pageY - $('#floor-plan').offset().top - mouseOffsetY}px` });
    })

    $(document).on('mouseup', function () {
        isDraggingSeat = false;
    })

















    $('#employee-list').on('dragstart', '.employee-item', function (event) {
        const employeeName = $(this).find('.employee-name').text().trim();
        const employeeDepartment = $(this).find('.employee-department').text().trim();
        const employeeRole = $(this).find('.employee-role').text().trim();
        const employeeExtension = $(this).find('.employee-extension').text().trim();
        const employeeData = {
            name: employeeName,
            department: employeeDepartment,
            role: employeeRole,
            extension: employeeExtension
        };
        event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(employeeData));
    });

    $(document).on('dragover', '.seat', function (event) {
        event.preventDefault();
    });

    $(document).on('drop', '.seat', function (event) {
        const currentSeatText = $(this).find('.seat-employee-info').text().trim();
        console.log(currentSeatText);
        if (currentSeatText !== '') {
            console.log('座位已有人');
            const shouldReplace = confirm('座位已有員工，是否要取代？');
            if (shouldReplace) {
                console.log('員工放到座位上');
                const employeeText = event.originalEvent.dataTransfer.getData('text/plain');
                const employeeData = JSON.parse(employeeText);
                $(this).find('.seat-employee-info').empty();
                $(this).removeClass('management-seat-color quality-service-seat-color product-development-seat-color');
                $(this).find('.seat-employee-info').append($('<span>').text(employeeData.name));
                $(this).find('.seat-employee-info').append($('<span>').text(employeeData.department));
                $(this).find('.seat-employee-info').append($('<span>').text(employeeData.role));
                $(this).find('.seat-employee-info').append($('<span>').text(employeeData.extension));
                if (employeeData.department === '管理處') {
                    $(this).addClass('management-seat-color');

                } else if (employeeData.department === '品質與技術服務處') {

                    $(this).addClass('quality-service-seat-color');
                } else if (employeeData.department === '產品發展處') {
                    $(this).addClass('product-development-seat-color');

                }

            } else {
                return;
            }

        } else {
            console.log('座位沒有人');
            console.log('員工放到座位上');
            const employeeText = event.originalEvent.dataTransfer.getData('text/plain');
            const employeeData = JSON.parse(employeeText);
            $(this).find('.seat-employee-info').empty();
            $(this).find('.seat-employee-info').append($('<span>').text(employeeData.name));
            $(this).find('.seat-employee-info').append($('<span>').text(employeeData.department));
            $(this).find('.seat-employee-info').append($('<span>').text(employeeData.role));
            $(this).find('.seat-employee-info').append($('<span>').text(employeeData.extension));
            if (employeeData.department === '管理處') {
                $(this).addClass('management-seat-color');

            } else if (employeeData.department === '品質與技術服務處') {
                $(this).addClass('quality-service-seat-color');

            } else if (employeeData.department === '產品發展處') {
                $(this).addClass('product-development-seat-color');

            }

        }
    });










});