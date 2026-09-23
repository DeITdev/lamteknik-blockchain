// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ValidatorStorage {
    struct Validator {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Validator) public validatorRecords;
    string[] public validatorIds;
    mapping(string => bool) public validatorExists;

    event ValidatorStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event ValidatorUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeValidator(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !validatorExists[_recordId];

        validatorRecords[_recordId] = Validator({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            validatorIds.push(_recordId);
            validatorExists[_recordId] = true;
            emit ValidatorStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit ValidatorUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getValidator(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(validatorExists[_recordId], "Validator does not exist");

        Validator memory item = validatorRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalValidator() public view returns (uint256) {
        return validatorIds.length;
    }

    function getValidatorIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < validatorIds.length, "Index out of bounds");
        return validatorIds[_index];
    }

    function getAllValidatorIds() public view returns (string[] memory) {
        return validatorIds;
    }

    function doesValidatorExist(string memory _recordId) public view returns (bool) {
        return validatorExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalValidator,
        string[] memory allValidatorIds
    ) {
        return (validatorIds.length, validatorIds);
    }

    function getValidatorMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(validatorExists[_recordId], "Validator does not exist");

        Validator memory item = validatorRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
