$(document).ready(function () {
    let isSeatEditMode = false;
    $('#edit-seat-button').on('click', function () {
        isSeatEditMode = !isSeatEditMode;
        console.log(isSeatEditMode);

    });
    $('#floor-plan').on('click', function (event) {
        if (isSeatEditMode == false) {
            return;
        }
        console.log('點擊平面圖');

    });






















    $(document).on('dragstart', '.employee-item', function (event) {
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