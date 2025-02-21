DELIMITER //

CREATE TRIGGER calcularNP
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    IF NEW.numero_puertas IS NOT NULL AND NEW.numero_puertas >= 0 AND NEW.cantidad_a_mover >= 0 THEN
        SET NEW.NP = (NEW.numero_puertas * NEW.cantidad_a_mover) + (6 * NEW.cantidad_a_mover);
    ELSE
        SET NEW.NP = 0;
    END IF;
END //

DELIMITER ;