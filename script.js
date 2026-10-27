$(document).ready(function () {


    let isSeatEditMode = false;
    let isCompactView = false;
    let editingEmployeeId = null;

    $('#edit-seat-button').on('click', function () {
        isSeatEditMode = !isSeatEditMode;
        console.log(isSeatEditMode);

    });

    $('#add-seat-button').on('click', function () {
        if (isSeatEditMode === false) {
            return;
        }
        console.log('準備新增座位');
        const newSeat = $('<div class="seat">');
        newSeat.attr('id', 'seat-' + Date.now());
        newSeat.append('<div class="seat-employee-info">').css({ left: '50px', top: '290px' });
        $('#floor-plan').append(newSeat);
        saveSeats();

    });

    $('#delete-seat-button').on('click', function () {
        if (isSeatEditMode === false) {
            return;
        }

        if (selectedSeat === null) {
            alert('請先點選要刪除的座位');
            return;
        }
        const shouldDelete = confirm('確定要刪除這個座位嗎？');
        if (shouldDelete === false) {
            return;
        }
        const seatId = selectedSeat.attr('id');
        const seatedEmployee = employees.find(employee => employee.seatId === seatId);
        if (seatedEmployee !== undefined) {
            seatedEmployee.seatId = null;
            saveEmployees();
            renderEmployees();
        }
        selectedSeat.remove();
        saveSeats();
        selectedSeat = null;
    });

    $('#unassign-employee-button').on('click', function () {
        if (selectedSeat === null) {
            alert('請先點選要解除安排的座位');
            return;
        }

        const seatId = selectedSeat.attr('id');
        const seatedEmployee = employees.find(employee => employee.seatId === seatId);

        if (seatedEmployee === undefined) {
            alert('這個座位沒有員工');
            return;
        }
        seatedEmployee.seatId = null;
        saveEmployees();
        renderEmployees();

        renderSeatAssignments();
        selectedSeat = null;
    });

    $('#normal-view-button').on('click', function () {
        isCompactView = false;
        renderSeatAssignments();
    });

    $('#department-view-button').on('click', function () {
        isCompactView = true;
        renderSeatAssignments();
    });

    function saveSeats() {
        try {
            const seats = [];
            $('.seat').each(function () {
                seats.push({
                    id: $(this).attr('id'),
                    left: $(this).css('left'),
                    top: $(this).css('top')
                });
            });
            localStorage.setItem('seats', JSON.stringify(seats));
            $('#save-status').text('儲存狀態：已儲存');

        } catch {
            $('#save-status').text('儲存狀態：失敗');

        }
    }

    function loadSeats() {
        const seatsText = localStorage.getItem('seats');
        if (seatsText === null) {
            return;
        }
        const savedSeats = JSON.parse(seatsText);
        $('#floor-plan .seat').remove();
        for (const seatData of savedSeats) {
            const newSeat = $('<div class="seat">').attr('id', seatData.id);
            newSeat.append('<div class="seat-employee-info">');

            newSeat.css({
                left: seatData.left,
                top: seatData.top
            });

            $('#floor-plan').append(newSeat);
        }
    }

    const employeesText = localStorage.getItem('employees');
    let employees = JSON.parse(employeesText || '[]');

    const departmentsText = localStorage.getItem('departments');
    let departments = JSON.parse(
        departmentsText || '["管理處","品質與技術服務處","產品發展處"]'
    );

    const departmentColorsText = localStorage.getItem('departmentColors');
    let departmentColors = JSON.parse(departmentColorsText || '{}');
    for (const employee of employees) {
        if (!departments.includes(employee.department)) {
            departments.push(employee.department);
        }
    }


    function getDepartmentColor(departmentName) {
        if (!departmentColors[departmentName]) {
            const departmentCount = Object.keys(departmentColors).length;
            const hue = (departmentCount * 137.508) % 360;

            departmentColors[departmentName] = `hsl(${hue}, 65%, 80%)`;

            try {
                localStorage.setItem('departmentColors', JSON.stringify(departmentColors));
            } catch {
                $('#save-status').text('儲存狀態：失敗');
            }
        }

        return departmentColors[departmentName];
    }

    let employeeId = 0;
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].id >= employeeId) {
            employeeId = employees[i].id + 1;
        }
    }

    // 初始化
    loadSeats();
    renderSeatAssignments();
    renderEmployees();
    renderDepartmentOptions();
    const hasSavedData =
        employeesText !== null ||
        departmentsText !== null ||
        departmentColorsText !== null ||
        localStorage.getItem('seats') !== null;

    if (hasSavedData && $('#save-status').text() === '儲存狀態：尚未儲存') {
        $('#save-status').text('儲存狀態：已載入');
    }

    $('#add-employee-button').on('click', function () {
        const addEmployeeName = $('#add-employee-name').val().trim();
        const addEmployeeDepartment = $('#add-employee-department').val().trim();
        const addEmployeeRole = $('#add-employee-role').val().trim();
        const addEmployeeExtension = $('#add-employee-extension').val().trim();

        if (addEmployeeName === '' || addEmployeeDepartment === '' || addEmployeeRole === '') {
            alert('請輸入完整的員工資料');
            return;
        } else {
            let departmentSaveSucceeded = true;
            if (!departments.includes(addEmployeeDepartment)) {
                const shouldAddDepartment = confirm(`部門「${addEmployeeDepartment}」不存在，是否新增？`);

                if (shouldAddDepartment === false) {
                    return;
                }

                departments.push(addEmployeeDepartment);
                renderDepartmentOptions();
                departmentSaveSucceeded = saveDepartments();
            }
            const duplicateEmployee = employees.find(employee =>
                String(employee.id) !== String(editingEmployeeId) &&
                employee.name === addEmployeeName &&
                employee.department === addEmployeeDepartment &&
                employee.role === addEmployeeRole &&
                employee.extension === addEmployeeExtension
            );

            if (duplicateEmployee !== undefined) {
                const shouldContinue = confirm('已有相同的員工資料，是否仍要繼續？');

                if (shouldContinue === false) {
                    return;
                }
            }
            if (editingEmployeeId !== null) {
                const employeeToEdit = employees.find(
                    employee => String(employee.id) === String(editingEmployeeId)
                );
                if (employeeToEdit === undefined) {
                    return;
                }

                employeeToEdit.name = addEmployeeName;
                employeeToEdit.department = addEmployeeDepartment;
                employeeToEdit.role = addEmployeeRole;
                employeeToEdit.extension = addEmployeeExtension;
                const employeeSaveSucceeded = saveEmployees();

                if (departmentSaveSucceeded && employeeSaveSucceeded) {
                    $('#save-status').text('儲存狀態：已儲存');
                } else {
                    $('#save-status').text('儲存狀態：失敗');
                }
                renderEmployees();
                renderSeatAssignments();

                $('#add-employee-name').val('');
                $('#add-employee-department').val('');
                $('#add-employee-role').val('');
                $('#add-employee-extension').val('');

                editingEmployeeId = null;
                $('#add-employee-button').text('新增員工');
                return;
            }
            employees.push({
                id: employeeId,
                name: addEmployeeName,
                department: addEmployeeDepartment,
                role: addEmployeeRole,
                extension: addEmployeeExtension,
                seatId: null
            })
            employeeId += 1;
            const employeeSaveSucceeded = saveEmployees();

            if (departmentSaveSucceeded && employeeSaveSucceeded) {
                $('#save-status').text('儲存狀態：已儲存');
            } else {
                $('#save-status').text('儲存狀態：失敗');
            }
            renderEmployees();

            $('#add-employee-name').val('');
            $('#add-employee-department').val('');
            $('#add-employee-role').val('');
            $('#add-employee-extension').val('');
        }
    });

    function renderEmployees() {
        $('#employee-list').empty();
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].seatId !== null && employees[i].seatId !== '' && employees[i].seatId !== undefined) {
                continue;
            }
            const newEmployee = $(`<li class="employee-item" draggable="true" data-id="${employees[i].id}">`);
            newEmployee.append($('<span class="employee-name">').text(employees[i].name));
            newEmployee.append($('<span class="employee-department">').text(employees[i].department));
            newEmployee.append($('<span class="employee-role">').text(employees[i].role));
            if (employees[i].extension !== '') {
                newEmployee.append($('<span class="employee-extension">').text('分機：' + employees[i].extension));
            } else {
                newEmployee.append($('<span>').addClass('employee-extension').text('分機：無'));
            }
            newEmployee.append($('<button type="button">')
                .addClass('remove-employee-button')
                .attr('data-id', employees[i].id)
                .text('移除')
            );
            newEmployee.append($('<button type="button">')
                .addClass('edit-employee-button')
                .attr('data-id', employees[i].id)
                .text('編輯')
            );
            $('#employee-list').append(newEmployee);
        }
        renderDepartmentLegend();
    }

    function renderDepartmentLegend() {
        $('#department-legend').empty();

        const departmentNames = [];
        for (const employee of employees) {
            if (!departmentNames.includes(employee.department)) {
                departmentNames.push(employee.department);
            }
        }
        for (const departmentName of departmentNames) {
            const legendItem = $('<li>').addClass('department-legend-item');
            const colorSwatch = $('<span>').addClass('color-swatch');

            legendItem.append(colorSwatch);
            legendItem.append($('<span>').text(departmentName));
            $('#department-legend').append(legendItem);
            colorSwatch.css('background-color', getDepartmentColor(departmentName));

        }
    }

    function renderDepartmentOptions() {
        const departmentOptions = $('#department-options');
        departmentOptions.empty();

        for (const department of departments) {
            departmentOptions.append(
                $('<option>').val(department)
            );
        }
    }

    function saveEmployees() {
        try {
            localStorage.setItem('employees', JSON.stringify(employees));
            $('#save-status').text('儲存狀態：已儲存');
            return true;

        } catch {
            $('#save-status').text('儲存狀態：失敗');
            return false;

        }
    }

    function saveDepartments() {
        try {
            localStorage.setItem('departments', JSON.stringify(departments));
            $('#save-status').text('儲存狀態：已儲存');
            return true;
        } catch {
            $('#save-status').text('儲存狀態：失敗');
            return false;
        }
    }

    $('#employee-list').on('click', '.remove-employee-button', function () {
        const employeeId = $(this).attr('data-id');
        const employeeIndex = employees.findIndex(
            employee => String(employee.id) === employeeId
        );
        if (employeeIndex === -1) {
            return;
        }

        const shouldDelete = confirm('確定要移除這位員工嗎？');
        if (shouldDelete === false) {
            return;
        }
        employees.splice(employeeIndex, 1);
        saveEmployees();
        renderEmployees();
    });

    $('#employee-list').on('click', '.edit-employee-button', function () {
        const employeeId = $(this).attr('data-id');
        const employeeData = employees.find(
            employee => String(employee.id) === employeeId
        );

        if (employeeData === undefined) {
            return;
        }

        editingEmployeeId = employeeData.id;
        $('#add-employee-button').text('儲存修改');
        $('#add-employee-name').val(employeeData.name);
        $('#add-employee-department').val(employeeData.department);
        $('#add-employee-role').val(employeeData.role);
        $('#add-employee-extension').val(employeeData.extension);
    });

    let isDraggingSeat = false;
    let selectedSeat = null;
    let mouseOffsetX = 0;
    let mouseOffsetY = 0;

    $('#floor-plan').on('click', '.seat', function () {
        selectedSeat = $(this);
    });

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

        const floorPlan = $('#floor-plan');
        const maxLeft = floorPlan.width() - selectedSeat.outerWidth();
        const maxTop = floorPlan.height() - selectedSeat.outerHeight();

        const left = event.pageX - floorPlan.offset().left - mouseOffsetX;
        const top = event.pageY - floorPlan.offset().top - mouseOffsetY;

        const boundedLeft = Math.max(0, Math.min(left, maxLeft));
        const boundedTop = Math.max(0, Math.min(top, maxTop));

        selectedSeat.css({ left: boundedLeft, top: boundedTop });
        // selectedSeat.css({ left: `${event.pageX - $('#floor-plan').offset().left - mouseOffsetX}px`, top: `${event.pageY - $('#floor-plan').offset().top - mouseOffsetY}px` });
    });

    $(document).on('mouseup', function () {
        if (isDraggingSeat) {
            saveSeats();
        }
        isDraggingSeat = false;
    });















    let tempEmployeeItem = null;

    $('#employee-list').on('dragstart', '.employee-item', function (event) {
        const draggedEmployeeId = $(this).attr('data-id');
        tempEmployeeItem = $(this);
        console.log(tempEmployeeItem);
        event.originalEvent.dataTransfer.setData('text/plain', draggedEmployeeId);
    });



    $(document).on('dragover', '.seat', function (event) {
        event.preventDefault();
    });

    $(document).on('drop', '.seat', function (event) {
        const targetSeatId = $(this).attr('id');
        const currentSeatText = $(this).find('.seat-employee-info').text().trim();
        const draggedEmployeeId = event.originalEvent.dataTransfer.getData('text/plain');
        const employeeData = employees.find(employee => String(employee.id) === draggedEmployeeId);
        console.log(currentSeatText);
        if (currentSeatText !== '') {
            console.log('座位已有人');
            const shouldReplace = confirm('座位已有員工，是否要取代？');
            if (shouldReplace === false) {
                return;
            }
        }
        console.log('員工放到座位上');
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].seatId === targetSeatId) {
                employees[i].seatId = null;
            }
        }
        employeeData.seatId = targetSeatId;
        saveEmployees();
        renderEmployees();
        renderSeatAssignments();
    });

    $('#floor-plan').on('dragstart', '.seat-employee-info[draggable="true"]', function (event) {
        const draggedEmployeeId = $(this).attr('data-id');
        event.originalEvent.dataTransfer.setData('text/plain', draggedEmployeeId);
    });

    function renderSeatAssignments() {
        $('.seat-employee-info')
            .empty()
            .removeAttr('draggable')
            .removeAttr('data-id');

        $('.seat')
            .removeClass('management-seat-color quality-service-seat-color product-development-seat-color')
            .css('background-color', '');
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].seatId === null || employees[i].seatId === '' || employees[i].seatId === undefined) {
                continue;
            }
            const targetSeat = $(`#${employees[i].seatId}`);
            const employeeInfo = targetSeat.find('.seat-employee-info');
            employeeInfo.attr('draggable', 'true');
            employeeInfo.attr('data-id', employees[i].id);
            employeeInfo.empty();
            employeeInfo.append($('<span>').text(employees[i].name));
            employeeInfo.append($('<span>').text(employees[i].department));

            if (isCompactView === false) {
                employeeInfo.append($('<span>').text(employees[i].role));

                if (employees[i].extension !== '') {
                    employeeInfo.append($('<span>').text('分機：' + employees[i].extension));
                } else {
                    employeeInfo.append($('<span>').text('分機：無'));
                }
            }

            employeeInfo.append(
                $('<button type="button">')
                    .addClass('remove-seated-employee-button')
                    .attr('data-id', employees[i].id)
                    .text('刪除員工')
            );

            employeeInfo.append(
                $('<button type="button">')
                    .addClass('edit-seated-employee-button')
                    .attr('data-id', employees[i].id)
                    .text('編輯員工')
            );

            targetSeat.css('background-color', getDepartmentColor(employees[i].department));
        }
    }

    $('#floor-plan').on('click', '.remove-seated-employee-button', function () {
        const employeeId = $(this).attr('data-id');
        const employeeIndex = employees.findIndex(
            employee => String(employee.id) === employeeId
        );
        if (employeeIndex === -1) {
            return;
        }

        const shouldDelete = confirm('確定要刪除這位員工嗎？');
        if (shouldDelete === false) {
            return;
        }
        employees.splice(employeeIndex, 1);
        saveEmployees();
        renderEmployees();
        renderSeatAssignments();
    });

    $('#floor-plan').on('click', '.edit-seated-employee-button', function () {
        const employeeId = $(this).attr('data-id');
        const employeeData = employees.find(
            employee => String(employee.id) === employeeId
        );

        if (employeeData === undefined) {
            return;
        }

        editingEmployeeId = employeeData.id;
        $('#add-employee-button').text('儲存修改');
        $('#add-employee-name').val(employeeData.name);
        $('#add-employee-department').val(employeeData.department);
        $('#add-employee-role').val(employeeData.role);
        $('#add-employee-extension').val(employeeData.extension);
    });







});
