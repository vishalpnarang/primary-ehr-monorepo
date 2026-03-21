package com.thinkitive.primus.tenant.repository;

import com.thinkitive.primus.tenant.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByLocationId(Long locationId);

    List<Room> findByLocationIdAndStatus(Long locationId, Room.RoomStatus status);
}
