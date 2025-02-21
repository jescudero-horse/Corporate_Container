DELIMITER //

CREATE TRIGGER calcular_valor_simbolo_especial
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor INT;

    IF NEW.simbolo_especial = "CC221" THEN
        SET NEW.valor_simbolo_especial = NEW.cantidad_a_mover * 42;
    ELSEIF NEW.simbolo_especial = "CC124" THEN
        SET NEW.valor_simbolo_especial = NEW.cantidad_a_mover * 32;
    END IF;
END //

DELIMITER ;