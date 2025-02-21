DELIMITER //

CREATE TRIGGER actualizar_PDU44
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.machine_used = 2 THEN
        SET valor = 39;
    ELSEIF NEW.machine_used = 4 THEN
        SET valor = 33;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.cantidad_a_mover IS NOT NULL AND NEW.cantidad_a_mover > 0 THEN
        SET NEW.PDU44 = (valor * NEW.cantidad_a_mover);
    ELSE
        SET NEW.PDU44 = 0;
    END IF;
END //

DELIMITER ;
