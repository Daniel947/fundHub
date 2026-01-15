// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract IdentityRegistry {
    address public owner;
    mapping(address => bool) public isVerified;
    mapping(address => string) public kycHash;

    event UserVerified(address indexed user, string kycHash);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function verifyUser(address user, string memory _kycHash) external onlyOwner {
        require(bytes(_kycHash).length > 10, "Invalid hash");
        isVerified[user] = true;
        kycHash[user] = _kycHash;
        emit UserVerified(user, _kycHash);
    }

    function verifySelf(string memory _kycHash) external {
        require(bytes(_kycHash).length > 10, "Invalid hash");
        isVerified[msg.sender] = true;
        kycHash[msg.sender] = _kycHash;
        emit UserVerified(msg.sender, _kycHash);
    }

    function isUserVerified(address user) external view returns (bool) {
        return isVerified[user];
    }
}
