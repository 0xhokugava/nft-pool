// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./integrations/uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./integrations/uniswapv2/interfaces/IUniswapV2Router02.sol";
import "./integrations/uniswapv2/interfaces/IUniswapV2Factory.sol";
import "./interfaces/IZapper.sol";
import "./token/NFTKeeper.sol";
import "./libs/Roles.sol";

import "hardhat/console.sol";

contract Zapper is IZapper, AccessControl {
    using SafeERC20 for IERC20;
    NFTKeeper nftKeeper;
    address nftKeeperToken;

    mapping(address => uint256) public nftToBalance;

    constructor(address _nftKeeperToken) {
        nftKeeperToken = _nftKeeperToken;
        nftKeeper = NFTKeeper(nftKeeperToken);
    }

    function _grabFee() internal {}

    function _lotteryOption() internal {}

    function _mintFTMonkeys(
        address _nftToken,
        uint[] memory tokenIds,
        address _receiver
    ) internal returns (uint nftKeeperTokenValue) {
        if (IERC721(_nftToken).balanceOf(_receiver) == 0)
            revert("Zero 721 balance");
        if (tokenIds.length == 0) revert("Should be at least 1 tokenID");
        for (uint i = 0; i < tokenIds.length; i++) {
            IERC721(_nftToken).transferFrom(
                _receiver,
                address(this),
                tokenIds[i]
            );
        }
        uint tokensForMint = tokenIds.length * 1e18;
        // MINT TOKENS
        nftKeeper.mint(_receiver, tokensForMint);
        nftToBalance[_nftToken] += tokensForMint;
        nftKeeperTokenValue = tokensForMint;
        if (IERC20(_nftToken).balanceOf(_receiver) <= 0) {
            revert ZeroTokenBalance(_nftToken);
        }
        emit VirtualMonkeysMinted(_nftToken, tokensForMint);
    }

    function addLiquidityWithNFT(
        address _ftToken,
        address _nftToken,
        address _pair,
        uint _amountFt,
        uint[] memory _amountsNft,
        address _routerAddr,
        address _receiver,
        uint _deadline
    ) public returns (uint liquidity) {
        address token0 = IUniswapV2Pair(_pair).token0();
        address token1 = IUniswapV2Pair(_pair).token1();

        address keeperToken = _ftToken == token0 ? token1 : token0;

        uint mintedTokens = _mintFTMonkeys(_nftToken, _amountsNft, _receiver);

        console.log(mintedTokens);

        if (IERC20(_ftToken).balanceOf(_receiver) <= 0) {
            revert ZeroTokenBalance(token0);
        }
        if (IERC20(keeperToken).balanceOf(_receiver) <= 0) {
            revert ZeroTokenBalance(token1);
        }

        safeTransferFrom(
            IERC20(_ftToken),
            msg.sender,
            address(this),
            _amountFt
        );
        safeTransferFrom(
            IERC20(keeperToken),
            msg.sender,
            address(this),
            mintedTokens
        );

        safeApprove(IERC20(_ftToken), _routerAddr, _amountFt);
        safeApprove(IERC20(keeperToken), _routerAddr, mintedTokens);

        (, , liquidity) = IUniswapV2Router01(_routerAddr).addLiquidity(
            _ftToken,
            keeperToken,
            _amountFt,
            mintedTokens,
            0,
            0,
            _receiver,
            _deadline
        );
    }

    function removeLiquidity(
        address _tokenA,
        address _tokenB,
        address _factory,
        address _router
    ) external returns (uint amountA, uint amountB) {
        address pair = IUniswapV2Factory(_factory).getPair(_tokenA, _tokenB);

        uint liquidity = IERC20(pair).balanceOf(address(this));
        safeApprove(IERC20(pair), _router, liquidity);

        (amountA, amountB) = IUniswapV2Router01(_router).removeLiquidity(
            _tokenA,
            _tokenB,
            liquidity,
            1,
            1,
            address(this),
            block.timestamp
        );
    }

    /**
     * @dev The transferFrom function may or may not return a bool.
     * The ERC-20 spec returns a bool, but some tokens don't follow the spec.
     * Need to check if data is empty or true.
     */
    function safeTransferFrom(
        IERC20 token,
        address sender,
        address recipient,
        uint amount
    ) internal {
        (bool success, bytes memory returnData) = address(token).call(
            abi.encodeCall(IERC20.transferFrom, (sender, recipient, amount))
        );
        require(
            success &&
                (returnData.length == 0 || abi.decode(returnData, (bool))),
            "Transfer from fail"
        );
    }

    /**
     * @dev The approve function may or may not return a bool.
     * The ERC-20 spec returns a bool, but some tokens don't follow the spec.
     * Need to check if data is empty or true.
     */
    function safeApprove(IERC20 token, address spender, uint amount) internal {
        (bool success, bytes memory returnData) = address(token).call(
            abi.encodeCall(IERC20.approve, (spender, amount))
        );
        require(
            success &&
                (returnData.length == 0 || abi.decode(returnData, (bool))),
            "Approve fail"
        );
    }
}
