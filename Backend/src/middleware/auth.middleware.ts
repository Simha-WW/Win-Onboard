/**
 * Authentication Middleware
 * Handles JWT and Microsoft token validation
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'HR' | 'FRESHER' | 'IT';
  };
}

interface JWTPayload {
  sub: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'HR' | 'FRESHER' | 'IT';
  exp: number;
  iat: number;
}

/**
 * Middleware to validate JWT tokens
 */
export const validateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  const token = authHeader.substring(7);
  
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const payload = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    // Add user info to request
    req.user = {
      id: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role
    };

    next();
  } catch (error) {
    console.error('JWT validation error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to validate Microsoft access tokens
 */
export const validateMicrosoftToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Development bypass - allow test tokens
    if (process.env.NODE_ENV === 'development' && accessToken.includes('mock_access_token')) {
      console.log('🧪 Using development bypass for Microsoft token validation');
      (req as any).microsoftUser = {
        id: 'test_microsoft_id',
        email: 'pulipatisimha@gmail.com',
        firstName: 'Pulipati',
        lastName: 'Simha',
        displayName: 'Pulipati Simha'
      };
      return next();
    }

    // Validate token with Microsoft Graph API
    const graphResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (graphResponse.status !== 200) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Microsoft token'
      });
    }

    const userInfo = graphResponse.data;
    
    // Add validated user info to request
    (req as any).microsoftUser = {
      id: userInfo.id,
      email: userInfo.mail || userInfo.userPrincipalName,
      firstName: userInfo.givenName,
      lastName: userInfo.surname,
      displayName: userInfo.displayName
    };

    next();
  } catch (error: any) {
    console.error('Microsoft token validation error:', error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Microsoft token'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Token validation failed'
    });
  }
};

/**
 * Middleware to check if user has HR role
 */
export const requireHRRole = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'HR') {
    return res.status(403).json({
      success: false,
      message: 'HR access required'
    });
  }

  next();
};

/**
 * Middleware to check if user has FRESHER role
 */
export const requireFresherRole = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'FRESHER') {
    return res.status(403).json({
      success: false,
      message: 'User access required'
    });
  }

  next();
};

/**
 * Middleware to allow both HR and FRESHER roles
 */
export const requireAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  next();
};

export { AuthenticatedRequest };