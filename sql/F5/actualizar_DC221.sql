DELIMITER //

CREATE TRIGGER actualizar_DC221
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    IF NEW.cantidad_a_mover IS NOT NULL AND NEW.cantidad_a_mover >= 0 THEN
        SET NEW.DC221 = (42 * NEW.cantidad_a_mover);
    ELSE
        SET NEW.DC221 = 0;
    END IF;
END //

DELIMITER ;