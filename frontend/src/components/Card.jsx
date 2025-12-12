import React from 'react';
import PropTypes from 'prop-types';

/**
 * Generic Card component
 * Follows "Surface" design token.
 */
const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`card ${className}`} {...props}>
            {children}
        </div>
    );
};

Card.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

export default Card;
