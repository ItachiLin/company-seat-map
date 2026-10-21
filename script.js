$(document).ready(function () {
    $(document).on('dragstart', '.employee-item', function (event) {
        const employeeName = $(this).find('.employee-name').text().trim();
        console.log('開始拖曳員工' + employeeName);
        const employeeDepartment = $(this).find('.employee-department').text().trim();
        console.log("開始拖曳員工部門" + employeeDepartment);
        const employeeRole = $(this).find('.employee-role').text().trim();
        console.log("開始拖曳員工職務" + employeeRole);
        const employeeExtension = $(this).find('.employee-extension').text().trim();
        console.log("開始拖曳員工分機" + employeeExtension);
        const employeeData = {
            name: employeeName,
            department: employeeDepartment,
            role: employeeRole,
            extension: employeeExtension
        };
        event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify(employeeData));





        console.log(JSON.stringify(employeeData));
        console.log(typeof JSON.stringify(employeeData));



        console.log(employeeData);
        console.log(typeof employeeData);


    });

    $(document).on('dragover', '.seat', function (event) {
        event.preventDefault();
    });

    $(document).on('drop', '.seat', function (event) {
        console.log('員工放到座位上');
        const employeeText = event.originalEvent.dataTransfer.getData('text/plain');
        console.log(employeeText);
        const employeeData = JSON.parse(employeeText);
        console.log(employeeData);
        $(this).find('.seat-employee-info').append($('<span>').text(employeeData.name));
        console.log(employeeData.name);
        $(this).find('.seat-employee-info').append($('<span>').text(employeeData.department));
        $(this).find('.seat-employee-info').append($('<span>').text(employeeData.role));
        $(this).find('.seat-employee-info').append($('<span>').text(employeeData.extension));
    });







});