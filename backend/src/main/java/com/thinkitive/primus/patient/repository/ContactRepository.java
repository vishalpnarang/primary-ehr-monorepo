package com.thinkitive.primus.patient.repository;

import com.thinkitive.primus.patient.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {

    List<Contact> findByTypeAndTenantId(Contact.ContactType type, Long tenantId);

    List<Contact> findByTenantId(Long tenantId);

    List<Contact> findByTenantIdAndArchiveFalse(Long tenantId);

    List<Contact> findByTypeAndTenantIdAndArchiveFalse(Contact.ContactType type, Long tenantId);
}
