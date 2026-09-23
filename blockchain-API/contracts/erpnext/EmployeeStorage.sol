// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmployeeStorage {
    struct Employee {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Employee) public employees;
    string[] public employeeIds;
    mapping(string => bool) public employeeExists;

    event EmployeeStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event EmployeeUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeEmployee(string memory _recordId, uint256 _createdTimestamp, uint256 _modifiedTimestamp, string memory _modifiedBy, string memory _allData) public returns (bool) {
        bool isNewEmployee = !employeeExists[_recordId];
        employees[_recordId] = Employee(_recordId, _createdTimestamp, _modifiedTimestamp, _modifiedBy, _allData);
        if (isNewEmployee) {
            employeeIds.push(_recordId);
            employeeExists[_recordId] = true;
            emit EmployeeStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit EmployeeUpdated(_recordId, _modifiedTimestamp);
        }
        return true;
    }

    function getEmployee(string memory _recordId) public view returns (string memory, uint256, uint256, string memory, string memory) {
        require(employeeExists[_recordId], "Employee does not exist");
        Employee memory employee = employees[_recordId];
        return (employee.recordId, employee.createdTimestamp, employee.modifiedTimestamp, employee.modifiedBy, employee.allData);
    }
    function getTotalEmployees() public view returns (uint256) { return employeeIds.length; }
    function getEmployeeIdByIndex(uint256 _index) public view returns (string memory) { require(_index < employeeIds.length, "Index out of bounds"); return employeeIds[_index]; }
    function getAllEmployeeIds() public view returns (string[] memory) { return employeeIds; }
    function doesEmployeeExist(string memory _recordId) public view returns (bool) { return employeeExists[_recordId]; }
    function getEmployeeMetadata(string memory _recordId) public view returns (string memory, uint256, uint256, string memory) {
        require(employeeExists[_recordId], "Employee does not exist");
        Employee memory employee = employees[_recordId];
        return (employee.recordId, employee.createdTimestamp, employee.modifiedTimestamp, employee.modifiedBy);
    }
}
