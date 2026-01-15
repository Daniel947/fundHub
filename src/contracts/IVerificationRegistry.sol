// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IVerificationRegistry
 * @notice Interface for the VerificationRegistry contract
 * @dev Used by CampaignManager to check creator verification status
 */
interface IVerificationRegistry {
    /**
     * @notice Check if a creator is verified
     * @param creator The address to check
     * @return bool True if the creator is verified
     */
    function isVerified(address creator) external view returns (bool);

    /**
     * @notice Get the timestamp when a creator was verified
     * @param creator The address to check
     * @return uint256 The verification timestamp (0 if not verified)
     */
    function verifiedAt(address creator) external view returns (uint256);

    /**
     * @notice Get the verification provider for a creator
     * @param creator The address to check
     * @return string The provider name (e.g., "sumsub")
     */
    function verificationProvider(
        address creator
    ) external view returns (string memory);
}
