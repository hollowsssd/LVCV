'use client';

import Cookies from 'js-cookie';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Type cho notification nhận từ server
export type Notification = {
    id: number;
    type: string;      // 'new_application', 'application_accepted', etc.
    title: string;     // Tiêu đề thông báo
    message: string;   // Nội dung chi tiết
    data?: Record<string, unknown>;  // Dữ liệu bổ sung (jobId, applicationId, etc.)
    isRead: boolean;   // Đã đọc chưa
    createdAt: string; // Thời gian tạo
};


const SOCKET_URL = 'http://localhost:8080';

export function useSocket() {
    // Ref để giữ socket instance (không re-render khi thay đổi)
    const socketRef = useRef<Socket | null>(null);

    // State để track trạng thái kết nối
    const [isConnected, setIsConnected] = useState(false);

    // State để lưu danh sách notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // State để đếm số thông báo chưa đọc
    const [unreadCount, setUnreadCount] = useState(0);

    // HÀM THÊM NOTIFICATION MỚI
    // Khi server gửi notification mới, thêm vào đầu list
    const addNotification = useCallback((noti: Notification) => {
        // Thêm vào đầu mảng (notification mới nhất lên trên)
        setNotifications(prev => [noti, ...prev]);

        // Nếu chưa đọc thì tăng count
        if (!noti.isRead) {
            setUnreadCount(prev => prev + 1);
        }
    }, []);

    // HÀM ĐÁNH DẤU ĐÃ ĐỌC
    // Cập nhật local state khi user đánh dấu đã đọc
    const markAsRead = useCallback((id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    // KHỞI TẠO SOCKET CONNECTION
    useEffect(() => {
        // Lấy token từ cookies
        const token = Cookies.get('token');

        // Không có token = chưa login → không connect socket
        if (!token) {
            // Nếu đang có socket thì disconnect
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setIsConnected(false);
            return;
        }

        // Đã có socket đang connected thì không tạo lại
        if (socketRef.current?.connected) {
            return;
        }

        // TẠO SOCKET CONNECTION 
        // io() sẽ tạo kết nối WebSocket đến server
        const socket = io(SOCKET_URL, {
            // Gửi token để server xác thực (socket middleware sẽ verify)
            auth: { token },
            // Ưu tiên websocket, fallback sang polling nếu cần
            transports: ['websocket', 'polling'],
        });

        // Lưu vào ref
        socketRef.current = socket;

        // LẮNG NGHE CÁC EVENTS 

        // Event: Kết nối thành công
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
            // Sau khi connect, server đã tự động join room 'user_{userId}'
            // (được xử lý trong server.js middleware)
        });

        // Event: Mất kết nối
        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        // Event: Lỗi kết nối (thường do token không hợp lệ)
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setIsConnected(false);
            // Nếu lỗi auth, có thể redirect về login
        });

        // Lắng nghe notification từ server
        // Server sẽ emit event này khi có thông báo mới
        socket.on('notification', (noti: Notification) => {
            console.log('Nhận notification mới:', noti);
            // Thêm vào state → UI tự động update
            addNotification(noti);
        });

        // CLEANUP KHI UNMOUNT
        // Khi component unmount (VD: chuyển trang), disconnect socket
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.off('notification');
            socket.disconnect();
            socketRef.current = null;
        };
    }, [addNotification]);

    // CHECK TOKEN THAY ĐỔI (LOGOUT)
    // Khi user logout, token bị xóa → cần disconnect socket
    useEffect(() => {
        const checkToken = () => {
            const token = Cookies.get('token');
            // Không còn token mà socket vẫn đang connect → disconnect
            if (!token && socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
                // Reset state
                setNotifications([]);
                setUnreadCount(0);
            }
        };

        // Check mỗi 2 giây
        const interval = setInterval(checkToken, 2000);
        return () => clearInterval(interval);
    }, []);

    // RETURN CÁC GIÁ TRỊ CHO COMPONENT SỬ DỤNG
    return {
        socket: socketRef.current,    // Socket instance (nếu cần emit gì đó)
        isConnected,                  // Trạng thái kết nối
        notifications,                // Danh sách notifications
        unreadCount,                  // Số chưa đọc
        setNotifications,             // Setter để merge với API data
        setUnreadCount,               // Setter để sync với API
        markAsRead,                   // Hàm đánh dấu đã đọc
    };
}
